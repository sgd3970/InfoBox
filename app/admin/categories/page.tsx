import { Suspense } from "react"
import type { Metadata } from "next"
import AdminCategoriesClient from "./client"
import Loading from "../loading"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "카테고리 관리 | 관리자 대시보드",
  description: "블로그 카테고리를 관리합니다.",
}

export default function AdminCategoriesPage() {
  return (
    <Suspense fallback={<Loading />}>
      <AdminCategoriesClient />
    </Suspense>
  )
} 