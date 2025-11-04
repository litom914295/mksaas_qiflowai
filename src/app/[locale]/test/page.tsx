export default function TestPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="p-8 border rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold mb-4">测试页面</h1>
        <p className="text-muted-foreground">如果你能看到这个页面，说明基本的路由和样式是正常的</p>
        <div className="mt-4 space-y-2">
          <p>✓ Next.js 路由正常</p>
          <p>✓ Tailwind CSS 正常</p>
          <p>✓ 国际化路由正常</p>
        </div>
      </div>
    </div>
  );
}
