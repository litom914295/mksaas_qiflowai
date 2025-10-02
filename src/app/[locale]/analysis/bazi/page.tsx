'use client'

import { calculateBaziAction } from '@/actions/qiflow/calculate-bazi'
import { CreditsPrice } from '@/components/qiflow/credits-price'
import { AgeVerification } from '@/components/qiflow/compliance/AgeVerification'
import { DisclaimerBar } from '@/components/qiflow/compliance/DisclaimerBar'
import { useActionState } from 'react'

function ResultPanel(props: { data: any }) {
	const { data } = props
	if (!data) return null
	if (data?.ok === false) {
		return (
			<div className="mt-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">输入无效，请检查后重试。</div>
		)
	}
	return (
		<div className="mt-4 space-y-2 rounded border border-green-200 bg-green-50 p-3 text-sm text-green-700">
			<div>计算完成，已消耗积分：{data?.creditsUsed}</div>
			<div>用户：{data?.userId ?? 'unknown'}</div>
			<div className="text-xs text-neutral-600">示例结果 pillars: {JSON.stringify(data?.result?.pillars)}</div>
		</div>
	)
}

function BaziForm() {
	const [state, formAction] = useActionState(async (_prev: any, formData: FormData) => {
		return await calculateBaziAction(formData)
	}, null)
	return (
		<>
			<form action={formAction} className="mt-4 space-y-3">
				<input name="name" placeholder="姓名" className="w-full rounded border px-3 py-2" required />
				<input name="birth" placeholder="出生日期 1990-01-01 08:08" className="w-full rounded border px-3 py-2" required />
				<select name="gender" className="w-full rounded border px-3 py-2">
					<option value="male">男</option>
					<option value="female">女</option>
				</select>
				<button className="rounded bg-black px-4 py-2 text-white">开始计算</button>
			</form>
			<ResultPanel data={state} />
		</>
	)
}

export default function Page() {
	return (
		<>
			<div className="mx-auto max-w-xl p-6">
				<h1 className="text-2xl font-semibold">八字分析</h1>
				<div className="mt-1"><CreditsPrice product="bazi" /></div>
				<BaziForm />
			</div>
			<AgeVerification />
			<DisclaimerBar />
		</>
	)
}
