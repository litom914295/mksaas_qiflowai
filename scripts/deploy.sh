#!/bin/bash

# qiflowai 自动化部署脚本
# 用法: ./deploy.sh [环境] [操作]
# 示例: ./deploy.sh production deploy

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 配置
ENVIRONMENT=${1:-production}
ACTION=${2:-deploy}
PROJECT_NAME="qiflowai"
DOCKER_REGISTRY=${DOCKER_REGISTRY:-""}
IMAGE_TAG=${IMAGE_TAG:-"latest"}

# 函数：打印带颜色的信息
print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 函数：检查依赖
check_dependencies() {
    print_info "检查依赖..."
    
    # 检查 Docker
    if ! command -v docker &> /dev/null; then
        print_error "Docker 未安装"
        exit 1
    fi
    
    # 检查 Docker Compose
    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        print_error "Docker Compose 未安装"
        exit 1
    fi
    
    print_info "依赖检查完成"
}

# 函数：加载环境变量
load_env() {
    local env_file=".env.${ENVIRONMENT}"
    
    if [ -f "$env_file" ]; then
        print_info "加载环境变量: $env_file"
        export $(cat "$env_file" | grep -v '^#' | xargs)
    else
        print_warning "环境文件不存在: $env_file"
        print_info "使用 .env.example 作为模板"
        cp .env.example "$env_file"
        print_error "请编辑 $env_file 后重新运行"
        exit 1
    fi
}

# 函数：构建镜像
build_image() {
    print_info "构建 Docker 镜像..."
    
    local image_name="${PROJECT_NAME}:${IMAGE_TAG}"
    
    if [ -n "$DOCKER_REGISTRY" ]; then
        image_name="${DOCKER_REGISTRY}/${image_name}"
    fi
    
    docker build \
        --build-arg NODE_ENV="${ENVIRONMENT}" \
        --cache-from "${image_name}" \
        -t "${image_name}" \
        .
    
    print_info "镜像构建完成: ${image_name}"
}

# 函数：推送镜像到仓库
push_image() {
    if [ -z "$DOCKER_REGISTRY" ]; then
        print_warning "未配置 Docker 仓库，跳过推送"
        return
    fi
    
    print_info "推送镜像到仓库..."
    
    local image_name="${DOCKER_REGISTRY}/${PROJECT_NAME}:${IMAGE_TAG}"
    
    docker push "${image_name}"
    
    print_info "镜像推送完成"
}

# 函数：部署应用
deploy() {
    print_info "开始部署 ${ENVIRONMENT} 环境..."
    
    # Docker Compose 部署
    if [ -f "docker-compose.yml" ]; then
        print_info "使用 Docker Compose 部署..."
        
        # 拉取最新镜像
        docker-compose pull
        
        # 停止旧容器
        docker-compose down
        
        # 启动新容器
        docker-compose up -d
        
        # 等待服务启动
        print_info "等待服务启动..."
        sleep 10
        
        # 健康检查
        health_check
    else
        print_error "docker-compose.yml 文件不存在"
        exit 1
    fi
    
    print_info "部署完成"
}

# 函数：健康检查
health_check() {
    print_info "执行健康检查..."
    
    local max_attempts=30
    local attempt=0
    local health_endpoint="http://localhost:3000/api/health"
    
    while [ $attempt -lt $max_attempts ]; do
        if curl -f -s "$health_endpoint" > /dev/null 2>&1; then
            print_info "健康检查通过"
            return 0
        fi
        
        attempt=$((attempt + 1))
        print_warning "健康检查失败，重试 ${attempt}/${max_attempts}"
        sleep 2
    done
    
    print_error "健康检查失败，服务可能未正常启动"
    docker-compose logs --tail=50 app
    exit 1
}

# 函数：回滚
rollback() {
    print_info "开始回滚..."
    
    # 获取上一个版本的标签
    local previous_tag="${PREVIOUS_TAG:-latest}"
    
    # 更新镜像标签
    export IMAGE_TAG="${previous_tag}"
    
    # 重新部署
    deploy
    
    print_info "回滚完成"
}

# 函数：查看日志
view_logs() {
    print_info "查看应用日志..."
    
    if [ -z "$2" ]; then
        docker-compose logs -f --tail=100
    else
        docker-compose logs -f --tail=100 "$2"
    fi
}

# 函数：备份数据
backup() {
    print_info "开始备份数据..."
    
    local backup_dir="./backups"
    local timestamp=$(date +%Y%m%d_%H%M%S)
    
    # 创建备份目录
    mkdir -p "$backup_dir"
    
    # 备份数据库
    if docker-compose ps | grep -q postgres; then
        print_info "备份 PostgreSQL 数据库..."
        docker-compose exec -T postgres pg_dump -U "${DB_USER:-qiflowai}" "${DB_NAME:-QiFlow AI_db}" > "${backup_dir}/db_backup_${timestamp}.sql"
    fi
    
    # 备份上传文件
    if [ -d "./uploads" ]; then
        print_info "备份上传文件..."
        tar -czf "${backup_dir}/uploads_backup_${timestamp}.tar.gz" ./uploads
    fi
    
    # 清理旧备份（保留最近30天）
    find "$backup_dir" -name "*.sql" -mtime +30 -delete
    find "$backup_dir" -name "*.tar.gz" -mtime +30 -delete
    
    print_info "备份完成，文件保存在: ${backup_dir}"
}

# 函数：恢复数据
restore() {
    print_info "开始恢复数据..."
    
    local backup_file="$1"
    
    if [ -z "$backup_file" ]; then
        print_error "请指定备份文件"
        echo "用法: $0 restore <backup_file>"
        exit 1
    fi
    
    if [ ! -f "$backup_file" ]; then
        print_error "备份文件不存在: $backup_file"
        exit 1
    fi
    
    # 恢复数据库
    if [[ "$backup_file" == *.sql ]]; then
        print_info "恢复数据库..."
        docker-compose exec -T postgres psql -U "${DB_USER:-qiflowai}" "${DB_NAME:-QiFlow AI_db}" < "$backup_file"
    fi
    
    # 恢复上传文件
    if [[ "$backup_file" == *.tar.gz ]]; then
        print_info "恢复上传文件..."
        tar -xzf "$backup_file" -C .
    fi
    
    print_info "恢复完成"
}

# 函数：清理
cleanup() {
    print_info "清理资源..."
    
    # 删除悬空镜像
    docker image prune -f
    
    # 删除未使用的容器
    docker container prune -f
    
    # 删除未使用的网络
    docker network prune -f
    
    # 删除未使用的卷（谨慎操作）
    if [ "$1" == "--volumes" ]; then
        print_warning "清理未使用的数据卷..."
        docker volume prune -f
    fi
    
    print_info "清理完成"
}

# 函数：显示状态
status() {
    print_info "服务状态:"
    docker-compose ps
    
    print_info "\n资源使用:"
    docker stats --no-stream
}

# 函数：显示帮助
show_help() {
    echo "qiflowai 部署脚本"
    echo ""
    echo "用法: $0 [环境] [操作] [参数]"
    echo ""
    echo "环境:"
    echo "  production    生产环境（默认）"
    echo "  staging       预发布环境"
    echo "  development   开发环境"
    echo ""
    echo "操作:"
    echo "  deploy        部署应用（默认）"
    echo "  build         构建镜像"
    echo "  push          推送镜像"
    echo "  rollback      回滚到上一版本"
    echo "  logs [服务]   查看日志"
    echo "  backup        备份数据"
    echo "  restore <文件> 恢复数据"
    echo "  status        查看状态"
    echo "  cleanup       清理资源"
    echo "  help          显示帮助"
    echo ""
    echo "示例:"
    echo "  $0 production deploy    # 部署到生产环境"
    echo "  $0 staging build        # 构建预发布环境镜像"
    echo "  $0 production logs app  # 查看生产环境应用日志"
    echo "  $0 production backup    # 备份生产环境数据"
}

# 主函数
main() {
    print_info "qiflowai 部署脚本 - 环境: ${ENVIRONMENT}"
    
    # 检查依赖
    check_dependencies
    
    # 加载环境变量
    load_env
    
    # 执行操作
    case "$ACTION" in
        deploy)
            build_image
            push_image
            deploy
            ;;
        build)
            build_image
            ;;
        push)
            push_image
            ;;
        rollback)
            rollback
            ;;
        logs)
            view_logs "$@"
            ;;
        backup)
            backup
            ;;
        restore)
            restore "$3"
            ;;
        status)
            status
            ;;
        cleanup)
            cleanup "$3"
            ;;
        help)
            show_help
            ;;
        *)
            print_error "未知操作: $ACTION"
            show_help
            exit 1
            ;;
    esac
    
    print_info "操作完成"
}

# 执行主函数
main "$@"