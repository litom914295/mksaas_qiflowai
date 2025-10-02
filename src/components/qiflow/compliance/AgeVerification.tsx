'use client'
import { useState } from 'react'

export function AgeVerification() {
	const [accepted, setAccepted] = useState(false)
	if (accepted) return null
	return (
		<div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-amber-50 px-4 py-3 text-sm text-amber-900">
			<span>本服务适用于 18 岁及以上用户。</span>
			<button className="ml-3 underline" onClick={() => setAccepted(true)}>我已年满 18 岁</button>
		</div>
	)
}

