import { Suspense } from "react"
import OfflineClientPage from "./OfflineClientPage"

export const metadata = {
  title: "오프라인 | InfoBox",
  description: "현재 오프라인 상태입니다.",
}

export const dynamic = "force-dynamic"

export default function OfflinePage() {
  return (
    <Suspense fallback={<div className="container py-20 text-center">로딩 중...</div>}>
      <OfflineClientPage />
    </Suspense>
  )
}
