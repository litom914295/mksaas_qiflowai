import Link from 'next/link';

export default function ReportNotFound() {
  return (
    <div className="container max-w-4xl py-12">
      <div className="text-center space-y-6">
        <div className="mx-auto w-20 h-20 rounded-full bg-muted flex items-center justify-center">
          <span className="text-5xl">🔍</span>
        </div>
        
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">报告未找到</h1>
          <p className="text-muted-foreground">
            该报告不存在或您没有权限访问
          </p>
        </div>

        <div className="flex gap-4 justify-center">
          <Link
            href="/reports"
            className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            查看我的报告
          </Link>
          <Link
            href="/"
            className="px-6 py-2 border rounded-lg hover:bg-muted transition-colors"
          >
            返回首页
          </Link>
        </div>
        
        <div className="pt-6 text-sm text-muted-foreground">
          <p>如果您刚生成了报告但看到此页面，请：</p>
          <ul className="mt-2 space-y-1">
            <li>• 等待几秒后刷新页面</li>
            <li>• 检查浏览器控制台是否有错误</li>
            <li>• 联系客服获取帮助</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
