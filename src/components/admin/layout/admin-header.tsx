"use client"

import { User } from "@/types/user"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import Link from "next/link"

interface AdminHeaderProps {
  user: Partial<User>
  locale: string
}

export function AdminHeader({ user, locale }: AdminHeaderProps) {
  return (
    <header className="flex h-16 items-center justify-between border-b bg-background px-6">
      <div className="text-sm text-muted-foreground">
        欢迎，{user?.name || user?.email}
      </div>
      <div className="flex items-center space-x-3">
        <Link href={`/${locale}`}>
          <Button variant="outline" size="sm">返回前台</Button>
        </Link>
        <form action={`/${locale}/logout`} method="post">
          <Button variant="destructive" size="sm">
            <LogOut className="mr-2 h-4 w-4" /> 退出登录
          </Button>
        </form>
      </div>
    </header>
  )
}
