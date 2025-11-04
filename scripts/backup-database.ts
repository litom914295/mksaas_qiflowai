/**
 * 数据库自动备份脚本
 * 支持 PostgreSQL 数据库备份到本地或云存储
 */

import { exec } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
dotenv.config();

const execAsync = promisify(exec);

interface BackupOptions {
  databaseUrl: string;
  backupDir: string;
  retentionDays: number;
  uploadToCloud?: boolean;
}

class DatabaseBackup {
  private options: BackupOptions;

  constructor(options: BackupOptions) {
    this.options = options;
  }

  /**
   * 执行备份
   */
  async backup(): Promise<void> {
    try {
      console.log('🔄 开始数据库备份...');

      // 1. 创建备份目录
      await this.ensureBackupDirectory();

      // 2. 生成备份文件名
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupFileName = `backup_${timestamp}.sql`;
      const backupFilePath = path.join(this.options.backupDir, backupFileName);

      // 3. 执行 pg_dump
      await this.performBackup(backupFilePath);

      // 4. 压缩备份文件
      const compressedPath = await this.compressBackup(backupFilePath);

      // 5. 上传到云存储（可选）
      if (this.options.uploadToCloud) {
        await this.uploadToCloud(compressedPath);
      }

      // 6. 清理旧备份
      await this.cleanOldBackups();

      // 7. 验证备份
      await this.verifyBackup(compressedPath);

      console.log('✅ 数据库备份完成!');
      console.log(`   文件: ${compressedPath}`);
      console.log(`   大小: ${this.getFileSize(compressedPath)}`);
    } catch (error) {
      console.error('❌ 备份失败:', error);
      throw error;
    }
  }

  /**
   * 确保备份目录存在
   */
  private async ensureBackupDirectory(): Promise<void> {
    if (!fs.existsSync(this.options.backupDir)) {
      fs.mkdirSync(this.options.backupDir, { recursive: true });
      console.log(`📁 创建备份目录: ${this.options.backupDir}`);
    }
  }

  /**
   * 执行 pg_dump 备份
   */
  private async performBackup(outputPath: string): Promise<void> {
    console.log('💾 执行 pg_dump...');

    // 解析数据库 URL
    const dbUrl = new URL(this.options.databaseUrl);
    const host = dbUrl.hostname;
    const port = dbUrl.port || '5432';
    const database = dbUrl.pathname.slice(1);
    const username = dbUrl.username;
    const password = dbUrl.password;

    // 设置环境变量（用于 pg_dump 认证）
    const env = {
      ...process.env,
      PGPASSWORD: password,
    };

    // 执行 pg_dump
    const command = `pg_dump -h ${host} -p ${port} -U ${username} -d ${database} -F p -f "${outputPath}"`;

    try {
      await execAsync(command, { env });
      console.log('✓ pg_dump 完成');
    } catch (error) {
      throw new Error(`pg_dump 失败: ${error}`);
    }
  }

  /**
   * 压缩备份文件
   */
  private async compressBackup(filePath: string): Promise<string> {
    console.log('🗜️  压缩备份文件...');

    const compressedPath = `${filePath}.gz`;
    const command = `gzip -c "${filePath}" > "${compressedPath}"`;

    try {
      await execAsync(command);

      // 删除原始 SQL 文件
      fs.unlinkSync(filePath);

      console.log('✓ 压缩完成');
      return compressedPath;
    } catch (error) {
      throw new Error(`压缩失败: ${error}`);
    }
  }

  /**
   * 上传到云存储
   */
  private async uploadToCloud(filePath: string): Promise<void> {
    console.log('☁️  上传到云存储...');

    // TODO: 实现云存储上传
    // 支持 AWS S3, Google Cloud Storage, Azure Blob Storage 等

    if (process.env.BACKUP_S3_BUCKET) {
      // AWS S3 示例
      console.log('  目标: AWS S3');
      console.log(`  Bucket: ${process.env.BACKUP_S3_BUCKET}`);

      // 使用 AWS CLI 或 SDK 上传
      // const command = `aws s3 cp "${filePath}" s3://${process.env.BACKUP_S3_BUCKET}/backups/`;
      // await execAsync(command);

      console.log('  ⚠️  云存储上传功能待实现');
    } else {
      console.log('  ⚠️  未配置云存储，跳过上传');
    }
  }

  /**
   * 清理旧备份
   */
  private async cleanOldBackups(): Promise<void> {
    console.log('🧹 清理旧备份...');

    const files = fs.readdirSync(this.options.backupDir);
    const backupFiles = files.filter(
      (f) => f.startsWith('backup_') && f.endsWith('.gz')
    );

    const now = Date.now();
    const retentionMs = this.options.retentionDays * 24 * 60 * 60 * 1000;

    let deletedCount = 0;

    for (const file of backupFiles) {
      const filePath = path.join(this.options.backupDir, file);
      const stats = fs.statSync(filePath);
      const fileAge = now - stats.mtimeMs;

      if (fileAge > retentionMs) {
        fs.unlinkSync(filePath);
        deletedCount++;
        console.log(`  删除: ${file}`);
      }
    }

    console.log(`✓ 清理完成，删除 ${deletedCount} 个旧备份`);
  }

  /**
   * 验证备份
   */
  private async verifyBackup(filePath: string): Promise<void> {
    console.log('🔍 验证备份...');

    // 检查文件是否存在
    if (!fs.existsSync(filePath)) {
      throw new Error('备份文件不存在');
    }

    // 检查文件大小
    const stats = fs.statSync(filePath);
    if (stats.size === 0) {
      throw new Error('备份文件为空');
    }

    // 检查文件是否为有效的 gzip 文件
    const command = `gzip -t "${filePath}"`;
    try {
      await execAsync(command);
      console.log('✓ 备份文件验证通过');
    } catch (error) {
      throw new Error('备份文件损坏');
    }
  }

  /**
   * 获取文件大小（格式化）
   */
  private getFileSize(filePath: string): string {
    const stats = fs.statSync(filePath);
    const bytes = stats.size;

    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    if (bytes < 1024 * 1024 * 1024)
      return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
    return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`;
  }

  /**
   * 列出所有备份
   */
  static listBackups(backupDir: string): void {
    console.log('📋 备份文件列表:');
    console.log('');

    if (!fs.existsSync(backupDir)) {
      console.log('  备份目录不存在');
      return;
    }

    const files = fs.readdirSync(backupDir);
    const backupFiles = files.filter(
      (f) => f.startsWith('backup_') && f.endsWith('.gz')
    );

    if (backupFiles.length === 0) {
      console.log('  暂无备份文件');
      return;
    }

    backupFiles.sort().reverse(); // 最新的在前

    for (const file of backupFiles) {
      const filePath = path.join(backupDir, file);
      const stats = fs.statSync(filePath);
      const size = DatabaseBackup.prototype.getFileSize.call(null, filePath);
      const date = stats.mtime.toISOString();

      console.log(`  ${file}`);
      console.log(`    大小: ${size}`);
      console.log(`    日期: ${date}`);
      console.log('');
    }
  }
}

// 主函数
async function main() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.error('❌ 错误: 未配置 DATABASE_URL');
    process.exit(1);
  }

  const backupDir =
    process.env.BACKUP_DIR || path.join(process.cwd(), 'backups');
  const retentionDays = Number.parseInt(
    process.env.BACKUP_RETENTION_DAYS || '7',
    10
  );
  const uploadToCloud = process.env.BACKUP_UPLOAD_TO_CLOUD === 'true';

  // 检查命令行参数
  const command = process.argv[2];

  if (command === 'list') {
    DatabaseBackup.listBackups(backupDir);
    return;
  }

  // 执行备份
  const backup = new DatabaseBackup({
    databaseUrl,
    backupDir,
    retentionDays,
    uploadToCloud,
  });

  await backup.backup();
}

// 运行
if (require.main === module) {
  main().catch((error) => {
    console.error('❌ 备份脚本执行失败:', error);
    process.exit(1);
  });
}

export { DatabaseBackup };
