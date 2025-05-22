import type { Metadata } from "next"
import { Suspense } from "react"
import { ProfileClient } from "./profile-client"

export const metadata: Metadata = {
  title: "내 프로필 | InfoBox",
  description: "InfoBox 계정 프로필 관리",
}

// 동적 렌더링 사용
export const dynamic = "force-dynamic"

export async function generateMetadata(): Promise<Metadata> {
  const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://example.com'

  return {
    title: "프로필 - 트렌드 스캐너",
    description: "트렌드 스캐너 프로필을 관리하세요.",
    openGraph: {
      title: "프로필 - 트렌드 스캐너",
      description: "트렌드 스캐너 프로필을 관리하세요.",
      type: "website",
      url: `${BASE_URL}/profile`,
    },
    alternates: {
      canonical: `${BASE_URL}/profile`,
    },
  }
}

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
