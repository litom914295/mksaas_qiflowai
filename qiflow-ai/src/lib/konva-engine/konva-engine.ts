/**
 * Konva.js 2D图形处理引擎主控制器
 *
 * 整合房间叠加、飞星盘渲染、交互控制等功能
 * 提供统一的2D图形处理接口
 */

import Konva from 'konva';
import { Room } from '../image-processing/types';
import { FlyingStarRenderer } from './flying-star-renderer';
import { RoomOverlayRenderer } from './room-overlay-renderer';
import {
  EventHandlers,
  KonvaEngineConfig,
  KonvaEngineState,
  KonvaStageConfig,
  LayerConfig,
} from './types';

export class KonvaEngine {
  private state: KonvaEngineState;
  private flyingStarRenderer: FlyingStarRenderer;
  private roomOverlayRenderer: RoomOverlayRenderer;
  private objectPool: Map<string, Konva.Node[]> = new Map();
  private viewportBounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  } | null = null;
  private renderQueue: (() => void)[] = [];
  private isRendering = false;
  private performanceMetrics = {
    renderCount: 0,
    lastRenderTime: 0,
    averageRenderTime: 0,
  };

  constructor(config: Partial<KonvaEngineConfig> = {}) {
    this.state = {
      stage: null,
      layers: new Map(),
      roomOverlays: new Map(),
      flyingStarPlates: new Map(),
      interactionState: {
        selectedRoom: null,
        hoveredRoom: null,
        isDragging: false,
        isZooming: false,
        isRotating: false,
        lastMousePosition: null,
      },
      transformState: {
        scale: 1,
        rotation: 0,
        x: 0,
        y: 0,
      },
      config: {
        enableDrag: true,
        enableZoom: true,
        enableRotation: true,
        enableSelection: true,
        enableHover: true,
        gridSize: 20,
        snapToGrid: false,
        showGrid: true,
        backgroundColor: '#f5f5f5',
        roomColors: {
          living_room: '#FFE5E5',
          bedroom: '#E5F3FF',
          kitchen: '#E5FFE5',
          bathroom: '#FFF5E5',
          dining_room: '#F0E5FF',
          study: '#E5FFFF',
          storage: '#FFE5F0',
          balcony: '#F5F5E5',
          corridor: '#E5E5E5',
          unknown: '#F0F0F0',
        },
        flyingStarColors: {
          favorable: '#4CAF50',
          unfavorable: '#F44336',
          neutral: '#FF9800',
        },
        ...config,
      },
      eventHandlers: {},
    };

    this.flyingStarRenderer = new FlyingStarRenderer(this.state.config);
    this.roomOverlayRenderer = new RoomOverlayRenderer(this.state.config);
  }

  /**
   * 初始化Konva舞台
   */
  initialize(stageConfig: KonvaStageConfig): void {
    try {
      // 创建舞台
      this.state.stage = new Konva.Stage({
        container: stageConfig.container,
        width: stageConfig.width,
        height: stageConfig.height,
        draggable: stageConfig.draggable ?? this.state.config.enableDrag,
      });

      // 创建图层
      this.createLayers();

      // 设置事件监听器
      this.setupEventListeners();

      // 渲染网格（如果启用）
      if (this.state.config.showGrid) {
        this.renderGrid();
      }

      console.log('Konva引擎初始化完成');
    } catch (error) {
      console.error('Konva引擎初始化失败:', error);
      throw new Error(
        `Konva引擎初始化失败: ${error instanceof Error ? error.message : '未知错误'}`
      );
    }
  }

  /**
   * 创建图层
   */
  private createLayers(): void {
    if (!this.state.stage) return;

    const layerConfigs: LayerConfig[] = [
      {
        id: 'background',
        name: '背景层',
        visible: true,
        opacity: 1,
        zIndex: 0,
      },
      {
        id: 'grid',
        name: '网格层',
        visible: this.state.config.showGrid,
        opacity: 0.3,
        zIndex: 1,
      },
      { id: 'rooms', name: '房间层', visible: true, opacity: 1, zIndex: 2 },
      {
        id: 'flying-stars',
        name: '飞星层',
        visible: true,
        opacity: 0.8,
        zIndex: 3,
      },
      { id: 'overlay', name: '叠加层', visible: true, opacity: 1, zIndex: 4 },
      { id: 'ui', name: 'UI层', visible: true, opacity: 1, zIndex: 5 },
    ];

    for (const config of layerConfigs) {
      const layer = new Konva.Layer({
        name: config.name,
        visible: config.visible,
        opacity: config.opacity,
      });

      this.state.layers.set(config.id, layer);
      this.state.stage.add(layer);
    }
  }

  /**
   * 设置事件监听器
   */
  private setupEventListeners(): void {
    if (!this.state.stage) return;

    // 舞台事件
    this.state.stage.on('mousedown', this.handleMouseDown.bind(this));
    this.state.stage.on('mousemove', this.handleMouseMove.bind(this));
    this.state.stage.on('mouseup', this.handleMouseUp.bind(this));
    this.state.stage.on('wheel', this.handleWheel.bind(this));

    // 房间层事件
    const roomsLayer = this.state.layers.get('rooms');
    if (roomsLayer) {
      roomsLayer.on('click', this.handleRoomClick.bind(this));
      roomsLayer.on('mouseover', this.handleRoomMouseOver.bind(this));
      roomsLayer.on('mouseout', this.handleRoomMouseOut.bind(this));
    }
  }

  /**
   * 渲染房间叠加层
   */
  renderRoomOverlays(rooms: Room[]): void {
    const roomsLayer = this.state.layers.get('rooms');
    if (!roomsLayer) return;

    // 创建房间叠加层
    this.state.roomOverlays =
      this.roomOverlayRenderer.createRoomOverlays(rooms);

    // 渲染到图层
    this.roomOverlayRenderer.renderToLayer(roomsLayer);
  }

  /**
   * 渲染飞星盘
   */
  renderFlyingStars(): void {
    const flyingStarsLayer = this.state.layers.get('flying-stars');
    if (!flyingStarsLayer || !this.state.stage) return;

    // 创建飞星盘
    this.state.flyingStarPlates =
      this.flyingStarRenderer.createFlyingStarPlates(
        this.state.stage.width(),
        this.state.stage.height(),
        this.state.roomOverlays
      );

    // 渲染到图层
    this.flyingStarRenderer.renderToLayer(flyingStarsLayer);
  }

  /**
   * 渲染网格
   */
  private renderGrid(): void {
    const gridLayer = this.state.layers.get('grid');
    if (!gridLayer || !this.state.stage) return;

    const width = this.state.stage.width();
    const height = this.state.stage.height();
    const gridSize = this.state.config.gridSize;

    // 绘制垂直线
    for (let x = 0; x <= width; x += gridSize) {
      const line = new Konva.Line({
        points: [x, 0, x, height],
        stroke: '#cccccc',
        strokeWidth: 1,
        opacity: 0.5,
      });
      gridLayer.add(line);
    }

    // 绘制水平线
    for (let y = 0; y <= height; y += gridSize) {
      const line = new Konva.Line({
        points: [0, y, width, y],
        stroke: '#cccccc',
        strokeWidth: 1,
        opacity: 0.5,
      });
      gridLayer.add(line);
    }

    gridLayer.batchDraw();
  }

  /**
   * 处理鼠标按下事件
   */
  private handleMouseDown(e: Konva.KonvaEventObject<MouseEvent>): void {
    this.state.interactionState.isDragging = true;
    this.state.interactionState.lastMousePosition = {
      x: e.evt.clientX,
      y: e.evt.clientY,
    };

    if (this.state.eventHandlers.onDrag) {
      this.state.eventHandlers.onDrag({
        x: e.evt.clientX,
        y: e.evt.clientY,
      });
    }
  }

  /**
   * 处理鼠标移动事件
   */
  private handleMouseMove(e: Konva.KonvaEventObject<MouseEvent>): void {
    if (this.state.interactionState.isDragging && this.state.stage) {
      const deltaX =
        e.evt.clientX - (this.state.interactionState.lastMousePosition?.x || 0);
      const deltaY =
        e.evt.clientY - (this.state.interactionState.lastMousePosition?.y || 0);

      this.state.transformState.x += deltaX;
      this.state.transformState.y += deltaY;

      this.state.stage.x(this.state.transformState.x);
      this.state.stage.y(this.state.transformState.y);

      this.state.interactionState.lastMousePosition = {
        x: e.evt.clientX,
        y: e.evt.clientY,
      };
    }
  }

  /**
   * 处理鼠标抬起事件
   */
  private handleMouseUp(e: Konva.KonvaEventObject<MouseEvent>): void {
    this.state.interactionState.isDragging = false;
    this.state.interactionState.lastMousePosition = null;
  }

  /**
   * 处理滚轮事件
   */
  private handleWheel(e: Konva.KonvaEventObject<WheelEvent>): void {
    if (!this.state.stage || !this.state.config.enableZoom) return;

    e.evt.preventDefault();

    const scaleBy = 1.1;
    const oldScale = this.state.stage.scaleX();
    const pointer = this.state.stage.getPointerPosition();

    if (!pointer) return;

    const mousePointTo = {
      x: (pointer.x - this.state.stage.x()) / oldScale,
      y: (pointer.y - this.state.stage.y()) / oldScale,
    };

    const newScale = e.evt.deltaY > 0 ? oldScale * scaleBy : oldScale / scaleBy;
    const clampedScale = Math.max(0.1, Math.min(5, newScale));

    this.state.stage.scale({ x: clampedScale, y: clampedScale });

    const newPos = {
      x: pointer.x - mousePointTo.x * clampedScale,
      y: pointer.y - mousePointTo.y * clampedScale,
    };

    this.state.stage.position(newPos);
    this.state.transformState.scale = clampedScale;
    this.state.transformState.x = newPos.x;
    this.state.transformState.y = newPos.y;

    if (this.state.eventHandlers.onZoom) {
      this.state.eventHandlers.onZoom(clampedScale);
    }
  }

  /**
   * 处理房间点击事件
   */
  private handleRoomClick(e: Konva.KonvaEventObject<MouseEvent>): void {
    if (!this.state.config.enableSelection) return;

    const target = e.target;
    const roomId = this.findRoomIdByShape(target);

    if (roomId) {
      this.selectRoom(roomId);
    } else {
      this.selectRoom(null);
    }
  }

  /**
   * 处理房间鼠标悬停事件
   */
  private handleRoomMouseOver(e: Konva.KonvaEventObject<MouseEvent>): void {
    if (!this.state.config.enableHover) return;

    const target = e.target;
    const roomId = this.findRoomIdByShape(target);

    if (roomId) {
      this.hoverRoom(roomId);
    }
  }

  /**
   * 处理房间鼠标离开事件
   */
  private handleRoomMouseOut(e: Konva.KonvaEventObject<MouseEvent>): void {
    if (!this.state.config.enableHover) return;

    const target = e.target;
    const roomId = this.findRoomIdByShape(target);

    if (roomId) {
      this.unhoverRoom(roomId);
    }
  }

  /**
   * 根据形状查找房间ID
   */
  private findRoomIdByShape(shape: Konva.Node): string | null {
    for (const [roomId, overlay] of this.state.roomOverlays) {
      if (overlay.konvaShape === shape) {
        return roomId;
      }
    }
    return null;
  }

  /**
   * 选择房间
   */
  selectRoom(roomId: string | null): void {
    // 清除之前的选择
    if (this.state.interactionState.selectedRoom) {
      this.roomOverlayRenderer.setRoomSelected(
        this.state.interactionState.selectedRoom,
        false
      );
    }

    // 设置新的选择
    this.state.interactionState.selectedRoom = roomId;
    if (roomId) {
      this.roomOverlayRenderer.setRoomSelected(roomId, true);
    }

    // 重新渲染房间层
    const roomsLayer = this.state.layers.get('rooms');
    if (roomsLayer) {
      this.roomOverlayRenderer.renderToLayer(roomsLayer);
    }

    // 触发事件
    if (this.state.eventHandlers.onRoomSelect) {
      this.state.eventHandlers.onRoomSelect(roomId);
    }
  }

  /**
   * 悬停房间
   */
  hoverRoom(roomId: string): void {
    this.state.interactionState.hoveredRoom = roomId;
    this.roomOverlayRenderer.setRoomHovered(roomId, true);

    // 重新渲染房间层
    const roomsLayer = this.state.layers.get('rooms');
    if (roomsLayer) {
      this.roomOverlayRenderer.renderToLayer(roomsLayer);
    }

    // 触发事件
    if (this.state.eventHandlers.onRoomHover) {
      this.state.eventHandlers.onRoomHover(roomId);
    }
  }

  /**
   * 取消悬停房间
   */
  unhoverRoom(roomId: string): void {
    this.state.interactionState.hoveredRoom = null;
    this.roomOverlayRenderer.setRoomHovered(roomId, false);

    // 重新渲染房间层
    const roomsLayer = this.state.layers.get('rooms');
    if (roomsLayer) {
      this.roomOverlayRenderer.renderToLayer(roomsLayer);
    }

    // 触发事件
    if (this.state.eventHandlers.onRoomHover) {
      this.state.eventHandlers.onRoomHover(null);
    }
  }

  /**
   * 设置飞星盘透明度
   */
  setFlyingStarOpacity(opacity: number): void {
    for (const plate of this.state.flyingStarPlates.values()) {
      this.flyingStarRenderer.setPlateOpacity(plate.id, opacity);
    }

    // 重新渲染飞星层
    const flyingStarsLayer = this.state.layers.get('flying-stars');
    if (flyingStarsLayer) {
      this.flyingStarRenderer.renderToLayer(flyingStarsLayer);
    }
  }

  /**
   * 设置事件处理器
   */
  setEventHandlers(handlers: Partial<EventHandlers>): void {
    this.state.eventHandlers = { ...this.state.eventHandlers, ...handlers };
  }

  /**
   * 获取当前状态
   */
  getState(): KonvaEngineState {
    return { ...this.state };
  }

  /**
   * 获取舞台
   */
  getStage(): Konva.Stage | null {
    return this.state.stage;
  }

  /**
   * 获取图层
   */
  getLayer(layerId: string): Konva.Layer | undefined {
    return this.state.layers.get(layerId);
  }

  /**
   * 从对象池获取对象
   */
  private getFromPool(type: string): Konva.Node | null {
    const pool = this.objectPool.get(type);
    if (pool && pool.length > 0) {
      return pool.pop()!;
    }
    return null;
  }

  /**
   * 将对象返回到对象池
   */
  private returnToPool(type: string, node: Konva.Node): void {
    if (!this.objectPool.has(type)) {
      this.objectPool.set(type, []);
    }
    this.objectPool.get(type)!.push(node);
  }

  /**
   * 检查对象是否在视口内
   */
  private isInViewport(bounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  }): boolean {
    if (!this.viewportBounds) return true;

    return !(
      bounds.x > this.viewportBounds.x + this.viewportBounds.width ||
      bounds.x + bounds.width < this.viewportBounds.x ||
      bounds.y > this.viewportBounds.y + this.viewportBounds.height ||
      bounds.y + bounds.height < this.viewportBounds.y
    );
  }

  /**
   * 更新视口边界
   */
  private updateViewportBounds(): void {
    if (!this.state.stage) return;

    const stage = this.state.stage;
    const scale = stage.scaleX();
    const x = -stage.x() / scale;
    const y = -stage.y() / scale;
    const width = stage.width() / scale;
    const height = stage.height() / scale;

    this.viewportBounds = { x, y, width, height };
  }

  /**
   * 批量渲染
   */
  private batchRender(): void {
    if (this.isRendering) return;

    this.isRendering = true;
    const startTime = performance.now();

    try {
      // 执行渲染队列
      while (this.renderQueue.length > 0) {
        const renderFn = this.renderQueue.shift();
        if (renderFn) {
          renderFn();
        }
      }

      // 更新性能指标
      const renderTime = performance.now() - startTime;
      this.performanceMetrics.renderCount++;
      this.performanceMetrics.lastRenderTime = renderTime;
      this.performanceMetrics.averageRenderTime =
        (this.performanceMetrics.averageRenderTime *
          (this.performanceMetrics.renderCount - 1) +
          renderTime) /
        this.performanceMetrics.renderCount;
    } finally {
      this.isRendering = false;
    }
  }

  /**
   * 添加渲染任务到队列
   */
  private queueRender(renderFn: () => void): void {
    this.renderQueue.push(renderFn);

    // 使用 requestAnimationFrame 进行异步渲染
    requestAnimationFrame(() => {
      this.batchRender();
    });
  }

  /**
   * 优化房间渲染（只渲染视口内的房间）
   */
  private optimizeRoomRendering(rooms: Room[]): Room[] {
    if (!this.viewportBounds) return rooms;

    return rooms.filter(room => {
      const bounds = this.calculateRoomBounds(room);
      return this.isInViewport(bounds);
    });
  }

  /**
   * 计算房间边界
   */
  private calculateRoomBounds(room: Room): {
    x: number;
    y: number;
    width: number;
    height: number;
  } {
    const xs = room.coordinates.map(p => p.x);
    const ys = room.coordinates.map(p => p.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);

    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
    };
  }

  /**
   * 获取性能指标
   */
  getPerformanceMetrics() {
    return { ...this.performanceMetrics };
  }

  /**
   * 清理对象池
   */
  private clearObjectPool(): void {
    for (const pool of this.objectPool.values()) {
      pool.forEach(node => node.destroy());
    }
    this.objectPool.clear();
  }

  /**
   * 销毁引擎
   */
  destroy(): void {
    if (this.state.stage) {
      this.state.stage.destroy();
      this.state.stage = null;
    }

    this.state.layers.clear();
    this.state.roomOverlays.clear();
    this.state.flyingStarPlates.clear();
    this.clearObjectPool();
  }
}
