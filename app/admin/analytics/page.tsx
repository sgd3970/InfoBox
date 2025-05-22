import { Suspense } from "react"
import type { Metadata } from "next"
import { Loader2 } from "lucide-react"
import { AdminAnalyticsClient } from "./client"

// 성능 데이터를 가져오는 함수 (API 라우트 사용)
async function getPerformanceData() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/admin/performance`, { cache: 'no-store' })

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

export const metadata: Metadata = {
  title: "관리자 - 분석 | InfoBox",
  description: "사이트 통계 및 분석 데이터를 확인합니다.",
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
