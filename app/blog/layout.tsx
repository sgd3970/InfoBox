import type React from "react"
import type { Metadata } from "next"
import { SidebarAds } from "@/components/sidebar-ads"

export const metadata: Metadata = {
  title: "블로그 | InfoBox",
  description: "최신 기술 트렌드와 유용한 정보를 제공하는 블로그입니다.",
}

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="container py-10">
      <div className="grid lg:grid-cols-[1fr_300px] gap-10">
        <div>{children}</div>
        <aside className="hidden lg:block space-y-6">
          <SidebarAds />
        </aside>
      </div>
    </div>
  )
}
