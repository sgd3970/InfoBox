"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function ProfileClient() {
  const router = useRouter()
  const { user, logout } = useAuth()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("")

  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }

    setName(user.name || "")
    setEmail(user.email || "")
  }, [user, router])

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage("")

    try {
      // 프로필 업데이트 로직 (실제 구현 필요)
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setMessage("프로필이 성공적으로 업데이트되었습니다.")
    } catch (error) {
      setMessage("프로필 업데이트 중 오류가 발생했습니다.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  if (!user) {
    return null
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>개인 정보</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">이름</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="이름" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">이메일</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="이메일"
                disabled
              />
              <p className="text-sm text-muted-foreground">이메일은 변경할 수 없습니다.</p>
            </div>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "업데이트 중..." : "프로필 업데이트"}
            </Button>
            {message && <p className="text-sm text-green-600">{message}</p>}
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>계정 관리</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium">계정 유형</p>
            <p className="text-sm text-muted-foreground">{user.role === "admin" ? "관리자" : "일반 사용자"}</p>
          </div>
          <div>
            <p className="text-sm font-medium">가입일</p>
            <p className="text-sm text-muted-foreground">{new Date().toLocaleDateString()}</p>
          </div>
          <Button variant="outline" onClick={handleLogout} className="w-full">
            로그아웃
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
