import { Suspense } from "react"
import InitDbClient from "./client"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "데이터베이스 초기화",
  description: "MongoDB 데이터베이스를 초기화하고 테스트 데이터를 삽입합니다.",
}

export default function InitDbPage() {
  return (
    <Suspense fallback={<div className="container py-10">로딩 중...</div>}>
      <InitDbClient />
    </Suspense>
  )
}
