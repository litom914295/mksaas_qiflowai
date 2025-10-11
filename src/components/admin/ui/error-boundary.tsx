'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertCircle, Home, RefreshCw } from 'lucide-react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

interface ErrorBoundaryProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function ErrorBoundary({ error, reset }: ErrorBoundaryProps) {
  useEffect(() => {
    // 记录错误到错误报告服务
    console.error('Error:', error)
  }, [error])

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <CardTitle>出错了</CardTitle>
          </div>
          <CardDescription>
            抱歉，页面加载时遇到了问题
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md bg-muted p-4">
            <p className="text-sm text-muted-foreground">
              错误信息：{error.message || '未知错误'}
            </p>
            {error.digest && (
              <p className="mt-1 text-xs text-muted-foreground">
                错误ID：{error.digest}
              </p>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex space-x-2">
          <Button onClick={reset} className="flex-1">
            <RefreshCw className="mr-2 h-4 w-4" />
            重试
          </Button>
          <Button
            variant="outline"
            onClick={() => (window.location.href = '/')}
            className="flex-1"
          >
            <Home className="mr-2 h-4 w-4" />
            返回首页
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

// 404 错误页面
export function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-6xl font-bold">404</CardTitle>
          <CardDescription className="text-center">
            页面未找到
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground">
            您访问的页面不存在或已被移除
          </p>
        </CardContent>
        <CardFooter>
          <Button
            onClick={() => (window.location.href = '/')}
            className="w-full"
          >
            <Home className="mr-2 h-4 w-4" />
            返回首页
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

// 无权限页面
export function Unauthorized() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-warning" />
            <CardTitle>无权限访问</CardTitle>
          </div>
          <CardDescription>
            您没有权限访问此页面
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            如需访问此页面，请联系管理员获取相应权限
          </p>
        </CardContent>
        <CardFooter>
          <Button
            onClick={() => window.history.back()}
            className="w-full"
          >
            返回上一页
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}