"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, FileText, Users, Settings, BarChart, MessageSquare, Tag, Database, Zap } from "lucide-react"

const adminNavItems = [
  { label: "대시보드", href: "/admin", icon: LayoutDashboard },
  { label: "포스트 관리", href: "/admin/posts", icon: FileText },
  { label: "카테고리 관리", href: "/admin/categories", icon: Tag },
  { label: "댓글 관리", href: "/admin/comments", icon: MessageSquare },
  { label: "사용자 관리", href: "/admin/users", icon: Users },
  { label: "통계", href: "/admin/analytics", icon: BarChart },
  { label: "데이터베이스", href: "/admin/database", icon: Database },
  { label: "성능", href: "/admin/performance", icon: Zap },
  { label: "설정", href: "/admin/settings", icon: Settings },
]

function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="space-y-4">
      <nav className="space-y-1">
        {adminNavItems.map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                pathname === item.href
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}

export default AdminSidebar
