import { Suspense } from "react"
import type { Metadata } from "next"
import AdminSettingsClient from "./client"
import Loading from "../loading"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "설정 | 관리자 대시보드",
  description: "사이트 설정을 관리합니다.",
}

export default function AdminSettingsPage() {
  return (
    <Suspense fallback={<Loading />}>
      <AdminSettingsClient />
    </Suspense>
  )
} 