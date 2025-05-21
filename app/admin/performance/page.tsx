import { Metadata } from "next"
import { Suspense } from "react"
import { AdminPerformanceClient } from "./client"
import Loading from "./loading"

export const metadata: Metadata = {
  title: "성능 관리 | 관리자 대시보드",
  description: "블로그 성능을 관리합니다.",
}

export const dynamic = "force-dynamic"

export default function AdminPerformancePage() {
  return (
    <Suspense fallback={<Loading />}>
      <AdminPerformanceClient />
    </Suspense>
  )
}
