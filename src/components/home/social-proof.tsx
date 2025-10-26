import React from 'react'

// 占位版 SocialProof 组件（后续接入动态数据与动画）
// 注意：为避免引入新依赖导致构建/类型问题，先提供静态占位，样式保持简洁
export const SocialProof: React.FC = () => {
  return (
    <section className="w-full py-10 md:py-16">
      <div className="mx-auto max-w-6xl px-4">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="rounded-lg border bg-background p-6 text-center">
            <p className="text-3xl font-bold">10000+</p>
            <p className="text-sm text-muted-foreground mt-1">注册用户</p>
          </div>
          <div className="rounded-lg border bg-background p-6 text-center">
            <p className="text-3xl font-bold">50000+</p>
            <p className="text-sm text-muted-foreground mt-1">分析报告生成</p>
          </div>
          <div className="rounded-lg border bg-background p-6 text-center">
            <p className="text-3xl font-bold">98%</p>
            <p className="text-sm text-muted-foreground mt-1">用户满意度</p>
          </div>
        </div>
        <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-lg border bg-background p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-sm font-medium">U{i}</div>
                <div className="text-sm font-medium">用户 {i}</div>
              </div>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                使用体验很棒，结果清晰专业，推荐给朋友一起试试！
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default SocialProof
