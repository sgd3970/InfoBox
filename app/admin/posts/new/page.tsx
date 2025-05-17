import { Suspense } from "react"
import type { Metadata } from "next"
import AdminNewPostClient from "./client"
import Loading from "./loading"
import AdminAuthCheck from "../../admin-auth-check"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "새 포스트 작성 | 관리자 대시보드",
  description: "새 블로그 포스트를 작성합니다.",
}

export default function AdminNewPostPage() {
  return (
    <AdminAuthCheck>
      <Suspense fallback={<Loading />}>
        <AdminNewPostClient />
      </Suspense>
    </AdminAuthCheck>
  )
} 