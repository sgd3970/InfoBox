import { Suspense } from "react"
import type { Metadata } from "next"
import { AdminAnalyticsClient } from "./client"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "관리자 - 분석 | InfoBox",
  description: "사이트 통계 및 분석 데이터를 확인합니다.",
}

export default function AdminAnalyticsPage() {
  return (
    <div className="container mx-auto py-6">
      <Suspense fallback={<div className="flex items-center justify-center h-96">로딩 중...</div>}>
        <AdminAnalyticsClient />
      </Suspense>
    </div>
  )
}
