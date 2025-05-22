import { Suspense } from "react"
import type { Metadata } from "next"
import { Loader2 } from "lucide-react"
import { AdminAnalyticsClient } from "./client"

// 성능 데이터를 가져오는 함수 (API 라우트 사용)
async function getPerformanceData() {
  try {
    const res = await fetch(`/api/admin/performance`, { cache: 'no-store' })

    if (!res.ok) {
      console.error("성능 데이터 API 호출 실패:", res.status)
      throw new Error('Failed to fetch performance data')
    }

    const performanceData = await res.json()
    return performanceData

  } catch (error) {
    console.error("성능 데이터 fetch 오류:", error)
    return null
  }
}

export const dynamic = "force-dynamic"

export async function generateMetadata(): Promise<Metadata> {
  const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://example.com'

  return {
    title: "분석 - 트렌드 스캐너",
    description: "트렌드 스캐너 사이트 분석 데이터를 확인하세요.",
    openGraph: {
      title: "분석 - 트렌드 스캐너",
      description: "트렌드 스캐너 사이트 분석 데이터를 확인하세요.",
      type: "website",
      url: `${BASE_URL}/admin/analytics`,
    },
    alternates: {
      canonical: `${BASE_URL}/admin/analytics`,
    },
  }
}

export default async function AdminAnalyticsPage() {
    const performanceData = await getPerformanceData()

  return (
    <div className="container mx-auto py-6">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">사이트 분석</h2>
        </div>

        <Suspense
          fallback={
            <div className="flex justify-center items-center min-h-[400px]">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">사이트 분석 데이터를 불러오는 중...</span>
            </div>
          }
        >
          <AdminAnalyticsClient performanceData={performanceData} />
        </Suspense>
      </div>
    </div>
  )
}
