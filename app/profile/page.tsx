import type { Metadata } from "next"
import { Suspense } from "react"
import { ProfileClient } from "./profile-client"

export const metadata: Metadata = {
  title: "내 프로필 | InfoBox",
  description: "InfoBox 계정 프로필 관리",
}

// 동적 렌더링 사용
export const dynamic = "force-dynamic"

export default function ProfilePage() {
  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">내 프로필</h1>
      <Suspense fallback={<div className="text-center">로딩 중...</div>}>
        <ProfileClient />
      </Suspense>
    </div>
  )
}
