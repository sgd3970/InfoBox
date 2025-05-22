import { Suspense } from "react"
import AdminDashboardClient from "./client"
import Loading from "./loading"
import { AdminAuthCheck } from "@/components/admin/admin-auth-check"

// 사이트 통계 데이터를 가져오는 함수 (API 라우트 사용)
async function getSiteStats() {
  try {
    const res = await fetch(`/api/stats`, {})

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

export const metadata = {
  title: "관리자 대시보드",
  description: "사이트 통계 및 관리 기능을 제공하는 관리자 대시보드입니다.",
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
