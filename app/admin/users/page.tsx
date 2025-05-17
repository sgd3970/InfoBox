import { Suspense } from "react"
import type { Metadata } from "next"
import AdminUsersClient from "./client"
import Loading from "../loading"
import AdminAuthCheck from "../admin-auth-check"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "사용자 관리 | 관리자 대시보드",
  description: "블로그 사용자를 관리합니다.",
}

export default function AdminUsersPage() {
  return (
    <AdminAuthCheck>
      <Suspense fallback={<Loading />}>
        <AdminUsersClient />
      </Suspense>
    </AdminAuthCheck>
  )
} 