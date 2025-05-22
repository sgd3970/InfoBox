import AdminCategoriesClient from "./client"
import type { Metadata } from "next"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "카테고리 관리 | 관리자 대시보드",
  description: "블로그 카테고리를 관리합니다.",
}

export default async function AdminCategoriesPage() {
  // Server Component에서 데이터 fetching 로직 제거

  return (
    // AdminCategoriesClient에서 데이터 fetching
    <AdminCategoriesClient />
  )
} 