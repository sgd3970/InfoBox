import type React from "react"
import type { Metadata } from "next"
import AdminAuthCheck from "./admin-auth-check"
import AdminSidebar from "./admin-sidebar"

export const metadata: Metadata = {
  title: "관리자 | InfoBox",
  description: "InfoBox 관리자 페이지",
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AdminAuthCheck>
      <div className="container py-10">
        <h1 className="text-3xl font-bold mb-8">관리자 대시보드</h1>

        <div className="grid md:grid-cols-[240px_1fr] gap-8">
          <AdminSidebar />
          <main>{children}</main>
        </div>
      </div>
    </AdminAuthCheck>
  )
}
