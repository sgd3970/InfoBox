"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { Search, Menu, X, User, LogOut } from "lucide-react"
import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { SearchAutocomplete } from "@/components/search-autocomplete"

const navItems = [
  { label: "홈", href: "/" },
  { label: "블로그", href: "/blog" },
  { label: "카테고리", href: "/blog/categories" },
  { label: "태그", href: "/blog/tags" },
  { label: "소개", href: "/about" },
]

export function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchDialogOpen, setSearchDialogOpen] = useState(false)
  const { auth, logout } = useAuth()

  const handleLogout = async () => {
    await logout()
    window.location.href = "/"
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
              IB
            </div>
            <span className="font-bold text-xl hidden sm:inline-block">InfoBox</span>
          </Link>

          <nav className="hidden md:flex gap-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href))
                    ? "text-foreground"
                    : "text-muted-foreground",
                )}
              >
                {item.label}
              </Link>
            ))}

            {/* 관리자 메뉴 */}
            {auth.user?.role === "admin" && (
              <Link
                href="/admin"
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  pathname?.startsWith("/admin") ? "text-foreground" : "text-muted-foreground",
                )}
              >
                관리자
              </Link>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" aria-label="검색" onClick={() => setSearchDialogOpen(true)}>
            <Search className="h-5 w-5" />
          </Button>

          <ThemeToggle />

          {/* 로그인/로그아웃 버튼 */}
          {auth.status === "authenticated" ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="사용자 메뉴">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{auth.user?.name}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile">프로필</Link>
                </DropdownMenuItem>
                {auth.user?.role === "admin" && (
                  <DropdownMenuItem asChild>
                    <Link href="/admin">관리자 페이지</Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  로그아웃
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="ghost" size="sm" asChild>
              <Link href="/login">로그인</Link>
            </Button>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="메뉴 열기"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* 모바일 메뉴 */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t">
          <nav className="container py-4 flex flex-col gap-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "px-4 py-2 rounded-md text-sm font-medium transition-colors",
                  pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href))
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}

            {/* 관리자 메뉴 */}
            {auth.user?.role === "admin" && (
              <Link
                href="/admin"
                className={cn(
                  "px-4 py-2 rounded-md text-sm font-medium transition-colors",
                  pathname?.startsWith("/admin")
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
                onClick={() => setMobileMenuOpen(false)}
              >
                관리자
              </Link>
            )}
          </nav>
        </div>
      )}

      {/* 검색 다이얼로그 */}
      <Dialog open={searchDialogOpen} onOpenChange={setSearchDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>검색</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <SearchAutocomplete />
          </div>
        </DialogContent>
      </Dialog>
    </header>
  )
}
