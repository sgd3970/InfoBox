import { Suspense } from "react"
import AdminDashboardClient from "./client"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "관리자 대시보드",
  description: "사이트 통계 및 관리 기능을 제공하는 관리자 대시보드입니다.",
}

export default function AdminDashboardPage() {
  return (
    <div className="container mx-auto py-6 px-4">
      <h1 className="text-3xl font-bold mb-6">관리자 대시보드</h1>
      <Suspense
        fallback={
          <div className="flex items-center justify-center h-96">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          </div>
        }
      >
        <AdminDashboardClient />
      </Suspense>
    </div>
  )
}
