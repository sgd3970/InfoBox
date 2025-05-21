import { Suspense } from "react"
import type { Metadata } from "next"
import AdminNewPostClient from "./client"
import Loading from "./loading"
import AdminAuthCheck from "../../admin-auth-check"
import { getCategories } from "@/lib/posts"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "새 포스트 작성 | 관리자 대시보드",
  description: "새 블로그 포스트를 작성합니다.",
}

export default async function AdminNewPostPage() {
  // Server Component에서 카테고리 데이터 fetching
  const categories = await getCategories()

  return (
    // Suspense 제거 (데이터 fetching이 서버에서 완료됨)
    <AdminNewPostClient initialCategories={categories} />
  )
} 