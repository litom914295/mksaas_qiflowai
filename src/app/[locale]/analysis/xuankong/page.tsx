'use client'

import { xuankongAnalysisAction } from '@/actions/qiflow/xuankong-analysis'
import { CreditsPrice } from '@/components/qiflow/credits-price'
import { ConfidenceBadge } from '@/components/qiflow/compass/ConfidenceBadge'
import { getConfidenceLevel } from '@/lib/qiflow/compass/confidence'
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
	const confidence = Number(data?.confidence ?? 0)
	const level = getConfidenceLevel(confidence)
	return (
		<div className="mt-4 space-y-3">
			<div className="flex items-center gap-2">
				<ConfidenceBadge value={confidence} />
				<span className="text-xs text-muted-foreground">置信度：{confidence.toFixed(2)}</span>
			</div>
			{level === 'low' ? (
				<div className="rounded border border-amber-200 bg-amber-50 p-3 text-sm">
					<p className="font-medium">自动判定已拒绝（置信度过低）。</p>
					<p className="mt-1">请手动输入关键参数或尝试以下校准建议：</p>
					<ul className="mt-1 list-inside list-disc">
						<li>确保传感器权限已开启且稳定持握设备</li>
						<li>远离强磁干扰与金属物体</li>
						<li>缓慢旋转进行罗盘校准</li>
					</ul>
					<ManualFallbackForm />
				</div>
			) : level === 'medium' ? (
				<div className="rounded border border-yellow-200 bg-yellow-50 p-3 text-sm">
					<p className="font-medium">置信度中等，建议进行校准以提升准确率（0.7~0.9）。</p>
					<ul className="mt-1 list-inside list-disc">
						<li>在开阔环境重复采样</li>
						<li>轻微 8 字摇摆手机完成校准</li>
					</ul>
				</div>
			) : (
				<div className="rounded border border-green-200 bg-green-50 p-3 text-sm text-green-700">分析完成，已生成建议。</div>
			)}
		</div>
	)
}

function ManualFallbackForm() {
	return (
		<form className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2">
			<input className="rounded border px-3 py-2" placeholder="坐山（度）" />
			<input className="rounded border px-3 py-2" placeholder="向首（度）" />
			<input className="rounded border px-3 py-2 md:col-span-2" placeholder="户型/楼层/特殊说明" />
			<button type="button" className="mt-1 w-fit rounded bg-neutral-800 px-3 py-1 text-white">保存手动输入</button>
		</form>
	)
}

function XuankongForm() {
	// initial state null; server action returns data object
	const [state, formAction] = useActionState(async (_prev: any, formData: FormData) => {
		return await xuankongAnalysisAction(formData)
	}, null)
	return (
		<>
			<form action={formAction} className="mt-4 space-y-3">
				<input name="address" placeholder="地址" className="w-full rounded border px-3 py-2" required />
				<input name="facing" placeholder="朝向（度）" type="number" className="w-full rounded border px-3 py-2" required />
				<button className="rounded bg-black px-4 py-2 text-white">开始分析</button>
			</form>
			<ResultPanel data={state} />
		</>
	)
}

export default function Page() {
	return (
		<>
			<div className="mx-auto max-w-xl p-6">
				<h1 className="text-2xl font-semibold">玄空飞星</h1>
				<div className="mt-1 flex items-center gap-2">
					<CreditsPrice product="xuankong" />
				</div>
				<XuankongForm />
			</div>
			<AgeVerification />
			<DisclaimerBar />
		</>
	)
}
