'use client'
import { useState } from 'react'

export function DisclaimerBar() {
	const [closed, setClosed] = useState(false)
	if (closed) return null
	return (
		<div className="fixed bottom-10 left-0 right-0 z-50 mx-auto w-full max-w-5xl rounded border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-700 shadow">
			<span>免责声明：本服务仅供参考，不构成专业建议或诊断，请结合实际情况与专业意见。</span>
			<button className="ml-3 underline" onClick={() => setClosed(true)}>我已知晓</button>
		</div>
	)
}

