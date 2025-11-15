import Link from 'next/link';

export default function ReportV22NotFound() {
  return (
    <div className="container max-w-4xl py-12">
      <div className="text-center space-y-6">
        <div className="mx-auto w-20 h-20 rounded-full bg-muted flex items-center justify-center">
          <span className="text-5xl">🔍</span>
        </div>
        
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">报告未找到</h1>
          <p className="text-muted-foreground">
            该 v2-2 报告不存在或您没有权限访问
          </p>
        </div>

        <div className="flex gap-4 justify-center">
          <Link
            href="/"
            className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            生成新报告
          </Link>
          <Link
            href="/reports"
            className="px-6 py-2 border rounded-lg hover:bg-muted transition-colors"
          >
            查看我的报告
          </Link>
        </div>
        
        <div className="pt-6 text-sm text-muted-foreground">
          <p className="mb-2">调试信息：</p>
          <ul className="space-y-1 text-left max-w-md mx-auto">
            <li>• 检查报告 ID 是否正确</li>
            <li>• 确认您已登录正确的账户</li>
            <li>• 查看浏览器控制台的错误日志</li>
            <li>• 报告可能仍在生成中，请等待后刷新</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
