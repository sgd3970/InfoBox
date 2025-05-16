import { Suspense } from "react"
import AdminPostsClient from "./client"
import Loading from "./loading"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "포스트 관리 | 관리자 대시보드",
  description: "블로그 포스트를 관리합니다.",
}

export default function AdminPostsPage() {
  return (
    <Suspense fallback={<Loading />}>
      <AdminPostsClient />
    </Suspense>
  )
}
