import type { Metadata } from "next"
import { Suspense } from "react"
import { RegisterForm } from "./register-form"

export const metadata: Metadata = {
  title: "회원가입 | InfoBox",
  description: "InfoBox에 새 계정을 만들어보세요.",
}

// 동적 렌더링 사용
export const dynamic = "force-dynamic"

export default function RegisterPage() {
  return (
    <div className="container py-10">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center">회원가입</h1>
        <Suspense fallback={<div className="text-center">로딩 중...</div>}>
          <RegisterForm />
        </Suspense>
      </div>
    </div>
  )
}
