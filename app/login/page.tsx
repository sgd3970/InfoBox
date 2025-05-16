import type { Metadata } from "next"
import { Suspense } from "react"
import { LoginForm } from "./login-form"

export const metadata: Metadata = {
  title: "로그인 | InfoBox",
  description: "InfoBox 계정으로 로그인하세요.",
}

// 동적 렌더링 사용
export const dynamic = "force-dynamic"

export default function LoginPage() {
  return (
    <div className="container py-10">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center">로그인</h1>
        <Suspense fallback={<div className="text-center">로딩 중...</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  )
}
