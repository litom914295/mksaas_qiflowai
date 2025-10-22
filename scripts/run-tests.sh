#!/bin/bash

# 玄空风水API测试运行脚本
# 用法: ./scripts/run-tests.sh [integration|performance|all]

set -e

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 打印带颜色的消息
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_header() {
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "  $1"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
}

# 检查开发服务器是否运行
check_server() {
    print_header "检查开发服务器"
    
    if curl -s http://localhost:3000/api/xuankong/diagnose > /dev/null; then
        print_success "开发服务器正在运行"
        return 0
    else
        print_warning "开发服务器未运行，正在启动..."
        npm run dev &
        SERVER_PID=$!
        
        # 等待服务器启动
        for i in {1..30}; do
            if curl -s http://localhost:3000 > /dev/null; then
                print_success "开发服务器已启动 (PID: $SERVER_PID)"
                echo $SERVER_PID > .server.pid
                return 0
            fi
            sleep 1
        done
        
        print_error "开发服务器启动失败"
        return 1
    fi
}

# 运行集成测试
run_integration_tests() {
    print_header "运行集成测试"
    
    if npm test -- src/tests/integration/xuankong-api.test.ts; then
        print_success "集成测试通过"
        return 0
    else
        print_error "集成测试失败"
        return 1
    fi
}

# 运行性能测试
run_performance_tests() {
    print_header "运行性能测试"
    
    if node --expose-gc node_modules/.bin/jest src/tests/performance/xuankong-performance.test.ts; then
        print_success "性能测试通过"
        return 0
    else
        print_error "性能测试失败"
        return 1
    fi
}

# 生成测试报告
generate_report() {
    print_header "生成测试报告"
    
    REPORT_FILE="test-report-$(date +%Y%m%d-%H%M%S).md"
    
    cat > "$REPORT_FILE" << EOF
# 玄空风水API测试报告

**生成时间**: $(date '+%Y-%m-%d %H:%M:%S')

## 测试概览

| 测试类型 | 状态 | 通过/总数 | 耗时 |
|---------|------|----------|------|
| 集成测试 | $INTEGRATION_STATUS | - | - |
| 性能测试 | $PERFORMANCE_STATUS | - | - |

## 性能指标

访问 http://localhost:3000/api/performance/stats?format=html 查看实时性能监控。

### 诊断API
- 目标响应时间: < 2秒
- 并发能力: 10+ 请求

### 化解方案API
- 目标响应时间: < 2秒
- 并发能力: 10+ 请求

### 综合分析API
- 目标响应时间: < 5秒
- 并发能力: 5+ 请求

## 建议

EOF

    if [ "$INTEGRATION_STATUS" = "✓" ] && [ "$PERFORMANCE_STATUS" = "✓" ]; then
        echo "所有测试通过，系统运行正常。" >> "$REPORT_FILE"
    else
        echo "部分测试失败，请查看详细日志。" >> "$REPORT_FILE"
    fi
    
    print_success "测试报告已生成: $REPORT_FILE"
}

# 清理函数
cleanup() {
    if [ -f .server.pid ]; then
        SERVER_PID=$(cat .server.pid)
        print_warning "停止开发服务器 (PID: $SERVER_PID)"
        kill $SERVER_PID 2>/dev/null || true
        rm .server.pid
    fi
}

# 设置清理陷阱
trap cleanup EXIT

# 主函数
main() {
    TEST_TYPE=${1:-all}
    
    print_header "玄空风水API测试套件"
    echo "测试类型: $TEST_TYPE"
    
    # 检查服务器
    check_server || exit 1
    
    INTEGRATION_STATUS="跳过"
    PERFORMANCE_STATUS="跳过"
    
    # 运行测试
    case $TEST_TYPE in
        integration)
            if run_integration_tests; then
                INTEGRATION_STATUS="✓"
            else
                INTEGRATION_STATUS="✗"
            fi
            ;;
        performance)
            if run_performance_tests; then
                PERFORMANCE_STATUS="✓"
            else
                PERFORMANCE_STATUS="✗"
            fi
            ;;
        all)
            if run_integration_tests; then
                INTEGRATION_STATUS="✓"
            else
                INTEGRATION_STATUS="✗"
            fi
            
            if run_performance_tests; then
                PERFORMANCE_STATUS="✓"
            else
                PERFORMANCE_STATUS="✗"
            fi
            ;;
        *)
            print_error "未知测试类型: $TEST_TYPE"
            echo "用法: $0 [integration|performance|all]"
            exit 1
            ;;
    esac
    
    # 生成报告
    generate_report
    
    # 显示摘要
    print_header "测试摘要"
    echo "集成测试: $INTEGRATION_STATUS"
    echo "性能测试: $PERFORMANCE_STATUS"
    
    # 返回状态
    if [ "$INTEGRATION_STATUS" = "✗" ] || [ "$PERFORMANCE_STATUS" = "✗" ]; then
        print_error "测试失败"
        exit 1
    else
        print_success "所有测试通过"
        exit 0
    fi
}

# 运行主函数
main "$@"
