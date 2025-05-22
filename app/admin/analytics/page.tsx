import { Suspense } from "react"
import type { Metadata } from "next"
import { AdminAnalyticsClient } from "./client"

// 성능 데이터를 가져오는 함수 (API 라우트 사용)
async function getPerformanceData() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/admin/performance`, {
        next: { revalidate: 60 }, // 필요에 따라 캐싱 설정
    })

    if (!res.ok) {
        console.error("성능 데이터 API 호출 실패:", res.status)
        return null
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
      <Suspense fallback={<div className="flex items-center justify-center h-96">로딩 중...</div>}>
        <AdminAnalyticsClient performanceData={performanceData} />
      </Suspense>
    </div>
  )
}
