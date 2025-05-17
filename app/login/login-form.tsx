"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/contexts/auth-context"
import { AlertCircle } from "lucide-react"

export function LoginForm() {
  const router = useRouter()
  const { login } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  // 로그인 함수에서 리디렉션 방식 변경
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const success = await login(email, password)

      if (success) {
        console.log("로그인 성공, 리디렉션 중...")

        // 로컬 스토리지에서 사용자 정보 가져오기
        const userStr = localStorage.getItem("user")
        if (userStr) {
          const user = JSON.parse(userStr)

          // 관리자인 경우 관리자 페이지로 리디렉션
          if (user.role === "admin") {
            console.log("관리자 계정 감지, 관리자 페이지로 리디렉션")
            window.location.href = "/admin"
          } else {
            // 일반 사용자는 홈페이지로 리디렉션
            window.location.href = "/"
          }
        } else {
          // 사용자 정보가 없는 경우 기본적으로 홈페이지로 리디렉션
          window.location.href = "/"
        }
      } else {
        setError("이메일 또는 비밀번호가 올바르지 않습니다.")
      }
    } catch (err) {
      console.error("로그인 오류:", err)
      setError("로그인 중 오류가 발생했습니다. 다시 시도해주세요.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-start">
          <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="email">이메일</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}          
          required
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">비밀번호</Label>          
        </div>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}          
          required
        />
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "로그인 중..." : "로그인"}
      </Button>      
    </form>
  )
}
