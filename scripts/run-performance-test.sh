#!/bin/bash

# 性能测试运行脚本
set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 配置
TEST_TYPE=${1:-load}  # load | stress | spike | soak
ENVIRONMENT=${2:-local}
REPORT_DIR="./tests/performance/reports"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# 打印函数
print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查依赖
check_dependencies() {
    print_info "检查测试依赖..."
    
    if ! command -v k6 &> /dev/null; then
        print_error "K6 未安装"
        echo "请安装 K6: https://k6.io/docs/getting-started/installation"
        exit 1
    fi
    
    if ! command -v jq &> /dev/null; then
        print_warning "jq 未安装，将无法生成格式化报告"
    fi
    
    print_info "依赖检查完成"
}

# 设置测试环境
setup_environment() {
    print_info "设置测试环境: ${ENVIRONMENT}"
    
    case $ENVIRONMENT in
        local)
            export BASE_URL="http://localhost:3000"
            export AUTH_TOKEN="test-token"
            ;;
        staging)
            export BASE_URL="https://staging.qiflowai.com"
            export AUTH_TOKEN="${STAGING_AUTH_TOKEN}"
            ;;
        production)
            print_error "不建议对生产环境进行压力测试"
            read -p "确定要继续吗？(y/n): " -n 1 -r
            echo
            if [[ ! $REPLY =~ ^[Yy]$ ]]; then
                exit 1
            fi
            export BASE_URL="https://api.qiflowai.com"
            export AUTH_TOKEN="${PROD_AUTH_TOKEN}"
            ;;
        *)
            print_error "未知环境: $ENVIRONMENT"
            exit 1
            ;;
    esac
}

# 创建报告目录
create_report_dir() {
    mkdir -p "$REPORT_DIR/$TIMESTAMP"
    print_info "报告将保存到: $REPORT_DIR/$TIMESTAMP"
}

# 运行负载测试
run_load_test() {
    print_info "开始负载测试..."
    
    k6 run \
        --out json="$REPORT_DIR/$TIMESTAMP/results.json" \
        --out influxdb=http://localhost:8086/k6 \
        --summary-export="$REPORT_DIR/$TIMESTAMP/summary.json" \
        tests/performance/k6-load-test.js
}

# 运行压力测试
run_stress_test() {
    print_info "开始压力测试..."
    
    k6 run \
        --out json="$REPORT_DIR/$TIMESTAMP/results.json" \
        --summary-export="$REPORT_DIR/$TIMESTAMP/summary.json" \
        --stage "5m:0,5m:100,10m:100,5m:200,10m:200,5m:300,10m:300,5m:0" \
        tests/performance/k6-load-test.js
}

# 运行峰值测试
run_spike_test() {
    print_info "开始峰值测试..."
    
    k6 run \
        --out json="$REPORT_DIR/$TIMESTAMP/results.json" \
        --summary-export="$REPORT_DIR/$TIMESTAMP/summary.json" \
        --stage "2m:0,30s:500,2m:500,30s:0" \
        tests/performance/k6-load-test.js
}

# 运行持久性测试
run_soak_test() {
    print_info "开始持久性测试（将运行2小时）..."
    
    k6 run \
        --out json="$REPORT_DIR/$TIMESTAMP/results.json" \
        --summary-export="$REPORT_DIR/$TIMESTAMP/summary.json" \
        --stage "5m:0,5m:50,120m:50,5m:0" \
        tests/performance/k6-load-test.js
}

# 生成报告
generate_report() {
    print_info "生成测试报告..."
    
    if command -v jq &> /dev/null; then
        # 解析摘要JSON
        if [ -f "$REPORT_DIR/$TIMESTAMP/summary.json" ]; then
            cat "$REPORT_DIR/$TIMESTAMP/summary.json" | jq '.' > "$REPORT_DIR/$TIMESTAMP/summary_formatted.json"
            
            # 提取关键指标
            echo "# 性能测试报告" > "$REPORT_DIR/$TIMESTAMP/report.md"
            echo "" >> "$REPORT_DIR/$TIMESTAMP/report.md"
            echo "## 测试信息" >> "$REPORT_DIR/$TIMESTAMP/report.md"
            echo "- 测试类型: $TEST_TYPE" >> "$REPORT_DIR/$TIMESTAMP/report.md"
            echo "- 测试环境: $ENVIRONMENT" >> "$REPORT_DIR/$TIMESTAMP/report.md"
            echo "- 测试时间: $TIMESTAMP" >> "$REPORT_DIR/$TIMESTAMP/report.md"
            echo "- 目标URL: $BASE_URL" >> "$REPORT_DIR/$TIMESTAMP/report.md"
            echo "" >> "$REPORT_DIR/$TIMESTAMP/report.md"
            
            echo "## 关键指标" >> "$REPORT_DIR/$TIMESTAMP/report.md"
            
            # 使用jq提取指标
            if [ -f "$REPORT_DIR/$TIMESTAMP/summary.json" ]; then
                echo "### HTTP请求" >> "$REPORT_DIR/$TIMESTAMP/report.md"
                jq -r '.metrics.http_reqs | "- 总请求数: \(.values.count)"' "$REPORT_DIR/$TIMESTAMP/summary.json" >> "$REPORT_DIR/$TIMESTAMP/report.md"
                jq -r '.metrics.http_req_duration | "- 平均响应时间: \(.values.avg)ms"' "$REPORT_DIR/$TIMESTAMP/summary.json" >> "$REPORT_DIR/$TIMESTAMP/report.md"
                jq -r '.metrics.http_req_duration | "- P95响应时间: \(.values["p(95)"])ms"' "$REPORT_DIR/$TIMESTAMP/summary.json" >> "$REPORT_DIR/$TIMESTAMP/report.md"
                jq -r '.metrics.http_req_failed | "- 失败率: \(.values.rate * 100)%"' "$REPORT_DIR/$TIMESTAMP/summary.json" >> "$REPORT_DIR/$TIMESTAMP/report.md"
                
                echo "" >> "$REPORT_DIR/$TIMESTAMP/report.md"
                echo "### 自定义指标" >> "$REPORT_DIR/$TIMESTAMP/report.md"
                jq -r '.metrics.errors | "- 错误率: \(.values.rate * 100)%"' "$REPORT_DIR/$TIMESTAMP/summary.json" >> "$REPORT_DIR/$TIMESTAMP/report.md" 2>/dev/null || true
                jq -r '.metrics.api_duration | "- API平均响应: \(.values.avg)ms"' "$REPORT_DIR/$TIMESTAMP/summary.json" >> "$REPORT_DIR/$TIMESTAMP/report.md" 2>/dev/null || true
                jq -r '.metrics.growth_api_duration | "- 增长API平均响应: \(.values.avg)ms"' "$REPORT_DIR/$TIMESTAMP/summary.json" >> "$REPORT_DIR/$TIMESTAMP/report.md" 2>/dev/null || true
            fi
            
            print_info "报告已生成: $REPORT_DIR/$TIMESTAMP/report.md"
        fi
    fi
    
    # 生成HTML报告（如果有k6-reporter）
    if command -v k6-reporter &> /dev/null; then
        k6-reporter "$REPORT_DIR/$TIMESTAMP/summary.json" -o "$REPORT_DIR/$TIMESTAMP/report.html"
        print_info "HTML报告已生成: $REPORT_DIR/$TIMESTAMP/report.html"
    fi
}

# 分析慢查询
analyze_slow_queries() {
    print_info "分析慢查询..."
    
    # 如果配置了数据库连接
    if [ -n "$DATABASE_URL" ]; then
        cat > "$REPORT_DIR/$TIMESTAMP/slow_queries.sql" << EOF
-- 查找慢查询
SELECT 
    query,
    calls,
    mean_exec_time,
    total_exec_time,
    min_exec_time,
    max_exec_time,
    stddev_exec_time
FROM pg_stat_statements
WHERE mean_exec_time > 1000  -- 超过1秒的查询
ORDER BY mean_exec_time DESC
LIMIT 20;

-- 查找最频繁的查询
SELECT 
    query,
    calls,
    mean_exec_time,
    total_exec_time
FROM pg_stat_statements
ORDER BY calls DESC
LIMIT 20;

-- 查找消耗最多时间的查询
SELECT 
    query,
    calls,
    total_exec_time,
    mean_exec_time
FROM pg_stat_statements
ORDER BY total_exec_time DESC
LIMIT 20;
EOF
        
        print_info "慢查询分析SQL已生成: $REPORT_DIR/$TIMESTAMP/slow_queries.sql"
    fi
}

# 清理
cleanup() {
    print_info "清理临时文件..."
    
    # 清理超过30天的旧报告
    find "$REPORT_DIR" -type d -mtime +30 -exec rm -rf {} + 2>/dev/null || true
    
    print_info "清理完成"
}

# 主函数
main() {
    print_info "qiflowai 性能测试工具"
    print_info "========================"
    
    check_dependencies
    setup_environment
    create_report_dir
    
    case $TEST_TYPE in
        load)
            run_load_test
            ;;
        stress)
            run_stress_test
            ;;
        spike)
            run_spike_test
            ;;
        soak)
            run_soak_test
            ;;
        *)
            print_error "未知测试类型: $TEST_TYPE"
            echo "可用类型: load | stress | spike | soak"
            exit 1
            ;;
    esac
    
    # 等待测试完成
    wait
    
    generate_report
    analyze_slow_queries
    cleanup
    
    print_info "测试完成！"
    print_info "查看报告: $REPORT_DIR/$TIMESTAMP/"
    
    # 如果测试失败，返回非零退出码
    if [ -f "$REPORT_DIR/$TIMESTAMP/summary.json" ]; then
        FAILED=$(jq -r '.root_group.checks | map(select(.fails > 0)) | length' "$REPORT_DIR/$TIMESTAMP/summary.json" 2>/dev/null || echo "0")
        if [ "$FAILED" -gt 0 ]; then
            print_error "测试中有 $FAILED 个检查失败"
            exit 1
        fi
    fi
}

# 错误处理
trap 'print_error "测试被中断"; exit 1' INT TERM

# 运行主函数
main