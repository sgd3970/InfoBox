import { Suspense } from "react"
import AdminDashboardClient from "./client"
import Loading from "./loading"
import { AdminAuthCheck } from "@/components/admin/admin-auth-check"
import { Metadata } from "next"

// 사이트 통계 데이터를 가져오는 함수 (API 라우트 사용)
async function getSiteStats() {
  try {
    // 환경 변수 사용 (fallback 포함)
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
    const res = await fetch(`${apiUrl}/api/stats`, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!res.ok) {
        console.error("사이트 통계 API 호출 실패:", res.status)
        return null
    }

    const stats = await res.json()
    return stats

  } catch (error) {
    console.error("사이트 통계 fetch 오류:", error)
    return null
  }
}

export const dynamic = "force-dynamic"

export async function generateMetadata(): Promise<Metadata> {
  const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://example.com'

  return {
    title: "관리자 - InfoBox",
    description: "InfoBox 관리자 페이지입니다.",
    openGraph: {
      title: "관리자 - InfoBox",
      description: "InfoBox 관리자 페이지입니다.",
      type: "website",
      url: `${BASE_URL}/admin`,
    },
    alternates: {
      canonical: `${BASE_URL}/admin`,
    },
  }
}

export default async function AdminDashboardPage() {
    const siteStats = await getSiteStats()

  return (
    <AdminAuthCheck>
      <div className="container mx-auto py-6 px-4">
        <h1 className="text-3xl font-bold mb-6">관리자 대시보드</h1>
        <Suspense fallback={<Loading />}>
          <AdminDashboardClient siteStats={siteStats} />
        </Suspense>
      </div>
    </AdminAuthCheck>
  )
}
