import { Suspense } from "react"
import type { Metadata } from "next"
import { Loader2 } from "lucide-react"
import { AdminDatabaseClient } from "./client"

// 동적 렌더링 사용 (정적 생성 대신)
export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "데이터베이스 관리 | 관리자 패널",
  description: "MongoDB 데이터베이스 인덱스, 연결 및 보안 설정을 관리합니다.",
}

export default function AdminDatabasePage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">데이터베이스 관리</h2>
      </div>

      <Suspense
        fallback={
          <div className="flex justify-center items-center min-h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">데이터베이스 정보를 불러오는 중...</span>
          </div>
        }
      >
        <AdminDatabaseClient />
      </Suspense>
    </div>
  )
}
