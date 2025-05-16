import { Suspense } from "react"
import { AdminPerformanceClient } from "./client"
import Loading from "./loading"

export const metadata = {
  title: "성능 모니터링 | 관리자 대시보드",
  description: "데이터베이스 및 서버 성능 모니터링 대시보드",
}

export const dynamic = "force-dynamic"

export default function AdminPerformancePage() {
  return (
    <Suspense fallback={<Loading />}>
      <AdminPerformanceClient />
    </Suspense>
  )
}
