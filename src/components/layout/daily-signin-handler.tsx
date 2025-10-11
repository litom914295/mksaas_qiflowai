"use client"

import { useEffect } from 'react'
import { authClient } from '@/lib/auth-client'
import { websiteConfig } from '@/config/website'

/**
 * DailySigninHandler
 * - 全站自动签到（进入任意页面触发）
 * - 每天最多一次，依赖 localStorage 标记
 */
export function DailySigninHandler() {
  const { data: session } = authClient.useSession()

  useEffect(() => {
    if (!websiteConfig.credits.enableCredits) return
    if (!websiteConfig.credits.dailySignin?.enable) return
    if (!session?.user?.id) return

    const key = 'qf_daily_signin_date'
    const today = new Date().toISOString().slice(0, 10)
    const last = typeof window !== 'undefined' ? localStorage.getItem(key) : null
    if (last === today) return

    ;(async () => {
      try {
        const res = await fetch('/api/credits/daily-signin', { method: 'POST' })
        const data = await res.json()
        if (data?.success) localStorage.setItem(key, today)
      } catch {}
    })()
  }, [session?.user?.id])

  return null
}
