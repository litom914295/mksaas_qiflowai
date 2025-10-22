# 管理后台部署指南

## 目录

1. [环境要求](#环境要求)
2. [部署方式](#部署方式)
3. [环境变量配置](#环境变量配置)
4. [数据库设置](#数据库设置)
5. [部署步骤](#部署步骤)
6. [监控和日志](#监控和日志)
7. [故障排除](#故障排除)

## 环境要求

### 最低配置
- Node.js 20.x 或更高版本
- PostgreSQL 14+ 
- Redis 6+
- 2GB RAM
- 10GB 磁盘空间

### 推荐配置
- Node.js 20.x LTS
- PostgreSQL 16
- Redis 7
- 4GB+ RAM
- 20GB+ SSD 磁盘空间
- CDN (CloudFlare, Fastly 等)

## 部署方式

### 1. Vercel 部署（推荐）

最简单快速的部署方式，适合大多数场景。

```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录 Vercel
vercel login

# 部署到 Vercel
vercel --prod
```

在 Vercel 控制台配置环境变量：
- `DATABASE_URL`
- `REDIS_URL` 
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`

### 2. Docker 容器部署

适合私有云或自建服务器。

```bash
# 构建镜像
docker build -t admin-platform:latest .

# 运行容器
docker run -d \
  --name admin-platform \
  -p 3000:3000 \
  -e DATABASE_URL="postgresql://..." \
  -e REDIS_URL="redis://..." \
  -e NEXTAUTH_SECRET="..." \
  -e NEXTAUTH_URL="https://yourdomain.com" \
  admin-platform:latest
```

### 3. Docker Compose 部署

包含所有依赖服务的完整部署。

```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: "postgresql://admin:password@db:5432/admindb"
      REDIS_URL: "redis://redis:6379"
      NEXTAUTH_SECRET: "${NEXTAUTH_SECRET}"
      NEXTAUTH_URL: "https://yourdomain.com"
    depends_on:
      - db
      - redis

  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: admin
      POSTGRES_PASSWORD: password
      POSTGRES_DB: admindb
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

启动服务：
```bash
docker-compose up -d
```

### 4. 传统服务器部署

适合 VPS 或专用服务器。

```bash
# 克隆代码
git clone https://github.com/yourorg/admin-platform.git
cd admin-platform

# 安装依赖
npm ci --production

# 构建应用
npm run build

# 运行数据库迁移
npm run db:migrate

# 使用 PM2 启动应用
pm2 start ecosystem.config.js
```

PM2 配置文件 (`ecosystem.config.js`):
```javascript
module.exports = {
  apps: [{
    name: 'admin-platform',
    script: 'npm',
    args: 'start',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
}
```

## 环境变量配置

### 必需的环境变量

```bash
# 数据库
DATABASE_URL=postgresql://user:password@host:5432/dbname

# Redis
REDIS_URL=redis://host:6379

# NextAuth
NEXTAUTH_SECRET=your-secret-key-min-32-chars
NEXTAUTH_URL=https://yourdomain.com

# 应用 URL
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

### 可选的环境变量

```bash
# 邮件服务 (Resend)
RESEND_API_KEY=re_xxxxxxxxxxxxx
RESEND_FROM=noreply@yourdomain.com

# 文件上传 (S3兼容)
S3_ACCESS_KEY_ID=xxxxx
S3_SECRET_ACCESS_KEY=xxxxx
S3_BUCKET=admin-uploads
S3_REGION=us-east-1
S3_ENDPOINT=https://s3.amazonaws.com

# 监控 (Sentry)
SENTRY_DSN=https://xxxxx@sentry.io/xxxxx
SENTRY_AUTH_TOKEN=xxxxx

# 功能开关
FEATURE_MFA_ENABLED=true
FEATURE_API_TOKENS=true
FEATURE_AUDIT_LOG=true
```

## 数据库设置

### 1. 创建数据库

```sql
CREATE DATABASE admindb;
CREATE USER adminuser WITH ENCRYPTED PASSWORD 'your-password';
GRANT ALL PRIVILEGES ON DATABASE admindb TO adminuser;
```

### 2. 运行迁移

```bash
# 生成迁移文件
npm run db:generate

# 执行迁移
npm run db:migrate
```

### 3. 初始化数据

```bash
# 创建超级管理员账号
npm run seed:admin

# 导入初始数据
npm run seed:data
```

## 部署步骤

### 生产环境部署检查清单

- [ ] 设置所有必需的环境变量
- [ ] 配置 HTTPS/SSL 证书
- [ ] 设置 CORS 策略
- [ ] 配置防火墙规则
- [ ] 设置备份策略
- [ ] 配置监控和告警
- [ ] 设置日志收集
- [ ] 配置 CDN
- [ ] 设置速率限制
- [ ] 启用安全头

### 部署流程

1. **准备阶段**
   ```bash
   # 运行测试
   npm run test
   npm run test:e2e
   
   # 检查类型
   npm run type-check
   
   # 代码检查
   npm run lint
   ```

2. **构建阶段**
   ```bash
   # 清理旧构建
   rm -rf .next
   
   # 构建生产版本
   npm run build
   ```

3. **部署阶段**
   ```bash
   # 备份数据库
   pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql
   
   # 运行迁移
   npm run db:migrate
   
   # 部署应用
   npm run deploy
   ```

4. **验证阶段**
   ```bash
   # 健康检查
   curl https://yourdomain.com/api/health
   
   # 运行冒烟测试
   npm run test:smoke
   ```

## 监控和日志

### 应用监控

1. **性能监控**
   - 使用 New Relic、Datadog 或 AppDynamics
   - 监控关键指标：响应时间、错误率、吞吐量

2. **错误追踪**
   - 集成 Sentry 或 Rollbar
   - 设置错误告警

3. **日志管理**
   - 使用 ELK Stack 或 Splunk
   - 集中式日志收集和分析

### 基础设施监控

1. **服务器监控**
   - CPU、内存、磁盘使用率
   - 网络流量和连接数

2. **数据库监控**
   - 查询性能
   - 连接池状态
   - 慢查询日志

3. **Redis 监控**
   - 内存使用
   - 命中率
   - 键过期情况

## 故障排除

### 常见问题

#### 1. 数据库连接失败
```bash
# 检查数据库服务状态
systemctl status postgresql

# 测试连接
psql $DATABASE_URL

# 检查防火墙规则
iptables -L | grep 5432
```

#### 2. Redis 连接问题
```bash
# 检查 Redis 服务
redis-cli ping

# 检查内存使用
redis-cli info memory
```

#### 3. 构建失败
```bash
# 清理缓存
npm cache clean --force
rm -rf node_modules .next

# 重新安装依赖
npm ci

# 详细构建日志
npm run build -- --debug
```

#### 4. 内存不足
```bash
# 增加 Node.js 内存限制
NODE_OPTIONS="--max-old-space-size=4096" npm run build

# 使用交换空间
sudo fallocate -l 4G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

### 性能优化

1. **启用缓存**
   - 配置 Redis 缓存策略
   - 使用 CDN 缓存静态资源
   - 启用浏览器缓存

2. **数据库优化**
   - 添加适当的索引
   - 使用连接池
   - 定期执行 VACUUM

3. **应用优化**
   - 启用 Gzip 压缩
   - 优化图片大小
   - 使用代码分割

### 安全加固

1. **设置安全头**
```nginx
# nginx.conf
add_header X-Frame-Options "SAMEORIGIN";
add_header X-Content-Type-Options "nosniff";
add_header X-XSS-Protection "1; mode=block";
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains";
```

2. **配置 CSP**
```javascript
// next.config.js
const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline';
  style-src 'self' 'unsafe-inline';
  img-src 'self' blob: data: https:;
  font-src 'self' data:;
  connect-src 'self' https://api.yourdomain.com;
`
```

3. **速率限制**
```javascript
// middleware.ts
import rateLimit from 'express-rate-limit'

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 分钟
  max: 100 // 限制 100 个请求
})
```

## 备份和恢复

### 自动备份脚本

```bash
#!/bin/bash
# backup.sh

# 配置
BACKUP_DIR="/backup"
DB_NAME="admindb"
DATE=$(date +%Y%m%d_%H%M%S)

# 备份数据库
pg_dump $DATABASE_URL > $BACKUP_DIR/db_$DATE.sql

# 备份上传文件
tar -czf $BACKUP_DIR/uploads_$DATE.tar.gz /app/uploads

# 删除 30 天前的备份
find $BACKUP_DIR -type f -mtime +30 -delete

# 上传到 S3（可选）
aws s3 cp $BACKUP_DIR/db_$DATE.sql s3://backup-bucket/
```

### 恢复流程

```bash
# 恢复数据库
psql $DATABASE_URL < backup.sql

# 恢复文件
tar -xzf uploads_backup.tar.gz -C /

# 清理 Redis 缓存
redis-cli FLUSHALL

# 重启应用
pm2 restart admin-platform
```

## 支持

如有问题，请：
1. 查看 [故障排除指南](#故障排除)
2. 查看 [GitHub Issues](https://github.com/yourorg/admin-platform/issues)
3. 联系技术支持：support@yourdomain.com