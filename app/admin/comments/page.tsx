import { Suspense } from "react"
import type { Metadata } from "next"
import AdminCommentsClient from "./client"
import Loading from "../loading"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "댓글 관리 | 관리자 대시보드",
  description: "블로그 댓글을 관리합니다.",
}

export default function AdminCommentsPage() {
  return (
    <Suspense fallback={<Loading />}>
      <AdminCommentsClient />
    </Suspense>
  )
} 