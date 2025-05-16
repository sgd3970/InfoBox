"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Loader2 } from "lucide-react"

function AdminAuthCheck({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { auth } = useAuth()

  useEffect(() => {
    if (auth.status === "unauthenticated") {
      router.push("/login")
    } else if (auth.status === "authenticated" && auth.user?.role !== "admin") {
      router.push("/")
    }
  }, [auth.status, auth.user, router])

  if (auth.status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (auth.status === "authenticated" && auth.user?.role === "admin") {
    return <>{children}</>
  }

  return null
}

export default AdminAuthCheck
