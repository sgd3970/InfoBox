import AdminNewPostClient from "./client"
import Loading from "../../loading"
import AdminAuthCheck from "../../admin-auth-check"
import { Metadata } from "next"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "새 글 작성 | 관리자",
  description: "새로운 블로그 글을 작성합니다.",
}

export default async function AdminNewPostPage() {
  return (
    <AdminAuthCheck>
      <AdminNewPostClient />
    </AdminAuthCheck>
  )
} 