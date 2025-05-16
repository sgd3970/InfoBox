import { Suspense } from "react"
import AboutClient from "./client"

export const metadata = {
  title: "소개 | InfoBox",
  description: "InfoBox 블로그에 대해 알아보세요.",
}

// 동적 렌더링 설정 추가
export const dynamic = "force-dynamic"

export default function AboutPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AboutClient />
    </Suspense>
  )
}
