import { Suspense } from "react"
import NotFoundClient from "./not-found/client"

// 동적 렌더링 설정 추가
export const dynamic = "force-dynamic"

export default function Custom404() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <NotFoundClient />
    </Suspense>
  )
}
