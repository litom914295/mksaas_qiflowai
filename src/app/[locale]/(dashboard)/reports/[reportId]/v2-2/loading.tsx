export default function ReportV22Loading() {
  return (
    <div className="container max-w-4xl py-12">
      <div className="text-center space-y-6">
        <div className="mx-auto w-20 h-20 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">正在加载报告</h2>
          <p className="text-muted-foreground">
            请稍候，正在获取您的专业报告...
          </p>
        </div>
        
        <div className="text-sm text-muted-foreground">
          <p>首次加载可能需要几秒钟</p>
        </div>
      </div>
    </div>
  );
}
