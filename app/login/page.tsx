import type { Metadata } from "next"
import { Suspense } from "react"
import { LoginForm } from "./login-form"

// 동적 렌더링 사용
export const dynamic = "force-dynamic"

export async function generateMetadata(): Promise<Metadata> {
  const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://example.com'

  return {
    title: "로그인 - InfoBox",
    description: "InfoBox에 로그인하세요.",
    openGraph: {
      title: "로그인 - InfoBox",
      description: "InfoBox에 로그인하세요.",
      type: "website",
      url: `${BASE_URL}/login`,
    },
    alternates: {
      canonical: `${BASE_URL}/login`,
    },
  }
}

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
