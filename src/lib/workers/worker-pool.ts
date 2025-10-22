/**
 * Worker线程池管理器
 * 用于处理CPU密集型的八字计算任务
 */

import { EventEmitter } from 'events';
import path from 'path';
import { Worker } from 'worker_threads';

interface WorkerTask {
  id: string;
  type: string;
  data: any;
  resolve: (value: any) => void;
  reject: (error: any) => void;
  startTime: number;
}

interface WorkerInfo {
  worker: Worker;
  busy: boolean;
  taskCount: number;
  lastUsed: number;
}

/**
 * Worker线程池配置
 */
interface WorkerPoolConfig {
  minWorkers?: number;
  maxWorkers?: number;
  workerTimeout?: number;
  taskTimeout?: number;
  autoScale?: boolean;
}

/**
 * Worker线程池管理器
 */
export class WorkerPool extends EventEmitter {
  private workers: Map<number, WorkerInfo> = new Map();
  private taskQueue: WorkerTask[] = [];
  private config: Required<WorkerPoolConfig>;
  private workerScript: string;
  private nextTaskId = 0;
  private isShuttingDown = false;

  constructor(workerScript: string, config: WorkerPoolConfig = {}) {
    super();

    this.workerScript = workerScript;
    this.config = {
      minWorkers: config.minWorkers || 2,
      maxWorkers: config.maxWorkers || 4,
      workerTimeout: config.workerTimeout || 60000, // 60秒
      taskTimeout: config.taskTimeout || 30000, // 30秒
      autoScale: config.autoScale !== false,
    };

    // 初始化最小数量的worker
    this.initializeWorkers();

    // 定期清理空闲worker
    setInterval(() => this.cleanupIdleWorkers(), 30000);
  }

  /**
   * 初始化worker
   */
  private initializeWorkers(): void {
    for (let i = 0; i < this.config.minWorkers; i++) {
      this.createWorker();
    }
  }

  /**
   * 创建新的worker
   */
  private createWorker(): Worker | null {
    if (this.workers.size >= this.config.maxWorkers) {
      return null;
    }

    const worker = new Worker(this.workerScript);
    const workerId = worker.threadId;

    // 监听worker消息
    worker.on('message', (message) => {
      this.handleWorkerMessage(workerId, message);
    });

    // 监听worker错误
    worker.on('error', (error) => {
      console.error(`Worker ${workerId} error:`, error);
      this.handleWorkerError(workerId, error);
    });

    // 监听worker退出
    worker.on('exit', (code) => {
      this.handleWorkerExit(workerId, code);
    });

    // 添加到池中
    this.workers.set(workerId, {
      worker,
      busy: false,
      taskCount: 0,
      lastUsed: Date.now(),
    });

    this.emit('worker:created', workerId);
    console.log(`Worker ${workerId} created. Pool size: ${this.workers.size}`);

    return worker;
  }

  /**
   * 执行任务
   */
  async execute<T = any>(type: string, data: any): Promise<T> {
    if (this.isShuttingDown) {
      throw new Error('Worker pool is shutting down');
    }

    return new Promise((resolve, reject) => {
      const task: WorkerTask = {
        id: `task_${++this.nextTaskId}`,
        type,
        data,
        resolve,
        reject,
        startTime: Date.now(),
      };

      // 设置任务超时
      const timeout = setTimeout(() => {
        const index = this.taskQueue.indexOf(task);
        if (index !== -1) {
          this.taskQueue.splice(index, 1);
        }
        reject(new Error(`Task ${task.id} timed out`));
      }, this.config.taskTimeout);

      // 包装resolve和reject以清除超时
      const originalResolve = task.resolve;
      const originalReject = task.reject;

      task.resolve = (value) => {
        clearTimeout(timeout);
        originalResolve(value);
      };

      task.reject = (error) => {
        clearTimeout(timeout);
        originalReject(error);
      };

      // 添加到队列并尝试执行
      this.taskQueue.push(task);
      this.processNextTask();
    });
  }

  /**
   * 处理下一个任务
   */
  private processNextTask(): void {
    if (this.taskQueue.length === 0) {
      return;
    }

    // 查找空闲的worker
    let idleWorker: WorkerInfo | undefined;

    for (const [workerId, info] of this.workers) {
      if (!info.busy) {
        idleWorker = info;
        break;
      }
    }

    // 如果没有空闲worker，尝试创建新的
    if (!idleWorker && this.config.autoScale) {
      const newWorker = this.createWorker();
      if (newWorker) {
        const newWorkerId = newWorker.threadId;
        idleWorker = this.workers.get(newWorkerId);
      }
    }

    // 如果还是没有可用的worker，等待
    if (!idleWorker) {
      return;
    }

    // 取出任务并执行
    const task = this.taskQueue.shift();
    if (!task) {
      return;
    }

    // 标记worker为忙碌
    idleWorker.busy = true;
    idleWorker.taskCount++;
    idleWorker.lastUsed = Date.now();

    // 发送任务到worker
    idleWorker.worker.postMessage({
      id: task.id,
      type: task.type,
      data: task.data,
    });

    // 记录任务分配
    this.emit('task:assigned', {
      taskId: task.id,
      workerId: idleWorker.worker.threadId,
    });
  }

  /**
   * 处理worker消息
   */
  private handleWorkerMessage(workerId: number, message: any): void {
    const workerInfo = this.workers.get(workerId);
    if (!workerInfo) {
      return;
    }

    // 标记worker为空闲
    workerInfo.busy = false;
    workerInfo.lastUsed = Date.now();

    // 查找对应的任务
    const taskIndex = this.taskQueue.findIndex((t) => t.id === message.id);

    if (taskIndex !== -1) {
      const task = this.taskQueue[taskIndex];
      this.taskQueue.splice(taskIndex, 1);

      // 处理结果
      if (message.error) {
        task.reject(new Error(message.error));
      } else {
        task.resolve(message.result);
      }

      // 记录任务完成
      const duration = Date.now() - task.startTime;
      this.emit('task:completed', {
        taskId: task.id,
        workerId,
        duration,
      });
    }

    // 处理下一个任务
    this.processNextTask();
  }

  /**
   * 处理worker错误
   */
  private handleWorkerError(workerId: number, error: Error): void {
    const workerInfo = this.workers.get(workerId);
    if (!workerInfo) {
      return;
    }

    // 移除故障的worker
    this.workers.delete(workerId);

    // 创建替代的worker
    if (this.workers.size < this.config.minWorkers && !this.isShuttingDown) {
      this.createWorker();
    }

    this.emit('worker:error', { workerId, error });
  }

  /**
   * 处理worker退出
   */
  private handleWorkerExit(workerId: number, code: number): void {
    const workerInfo = this.workers.get(workerId);
    if (!workerInfo) {
      return;
    }

    // 移除退出的worker
    this.workers.delete(workerId);

    // 如果不是正常退出，创建替代worker
    if (code !== 0 && !this.isShuttingDown) {
      console.error(`Worker ${workerId} exited with code ${code}`);
      if (this.workers.size < this.config.minWorkers) {
        this.createWorker();
      }
    }

    this.emit('worker:exit', { workerId, code });
  }

  /**
   * 清理空闲的worker
   */
  private cleanupIdleWorkers(): void {
    if (this.isShuttingDown) {
      return;
    }

    const now = Date.now();
    const workersToRemove: number[] = [];

    for (const [workerId, info] of this.workers) {
      // 保持最小数量的worker
      if (this.workers.size <= this.config.minWorkers) {
        break;
      }

      // 清理长时间未使用的worker
      if (!info.busy && now - info.lastUsed > this.config.workerTimeout) {
        workersToRemove.push(workerId);
      }
    }

    // 终止空闲的worker
    for (const workerId of workersToRemove) {
      const workerInfo = this.workers.get(workerId);
      if (workerInfo) {
        workerInfo.worker.terminate();
        this.workers.delete(workerId);
        console.log(`Worker ${workerId} terminated due to inactivity`);
      }
    }
  }

  /**
   * 获取池状态
   */
  getStatus(): {
    workers: number;
    busyWorkers: number;
    queueLength: number;
    totalTasks: number;
  } {
    let busyWorkers = 0;
    let totalTasks = 0;

    for (const info of this.workers.values()) {
      if (info.busy) {
        busyWorkers++;
      }
      totalTasks += info.taskCount;
    }

    return {
      workers: this.workers.size,
      busyWorkers,
      queueLength: this.taskQueue.length,
      totalTasks,
    };
  }

  /**
   * 关闭线程池
   */
  async shutdown(): Promise<void> {
    this.isShuttingDown = true;

    // 等待所有任务完成
    while (this.taskQueue.length > 0) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    // 终止所有worker
    const promises: Promise<void>[] = [];

    for (const [workerId, info] of this.workers) {
      promises.push(
        new Promise<void>((resolve) => {
          info.worker.once('exit', () => resolve());
          info.worker.terminate();
        })
      );
    }

    await Promise.all(promises);
    this.workers.clear();

    console.log('Worker pool shut down');
  }
}

// 创建全局线程池实例
let globalPool: WorkerPool | null = null;

/**
 * 获取全局线程池
 */
export function getWorkerPool(): WorkerPool {
  if (!globalPool) {
    const workerScript = path.join(__dirname, 'bazi-worker.js');
    globalPool = new WorkerPool(workerScript, {
      minWorkers: 2,
      maxWorkers: 4,
      autoScale: true,
    });
  }
  return globalPool;
}

/**
 * 关闭全局线程池
 */
export async function shutdownWorkerPool(): Promise<void> {
  if (globalPool) {
    await globalPool.shutdown();
    globalPool = null;
  }
}
