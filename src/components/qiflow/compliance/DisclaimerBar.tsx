'use client'

export function DisclaimerBar() {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-amber-50 border-t border-amber-200 p-2">
      <div className="mx-auto max-w-7xl px-4">
        <p className="text-center text-xs text-amber-800">
          <span className="font-medium">免责声明：</span>
          本服务仅供娱乐参考，不构成任何建议。请理性对待分析结果。
        </p>
      </div>
    </div>
  )
}