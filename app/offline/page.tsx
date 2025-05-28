import { Suspense } from "react"
import OfflineClientPage from "./OfflineClientPage"
import { Metadata } from "next"

export const dynamic = "force-dynamic"

export async function generateMetadata(): Promise<Metadata> {
  const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://example.com'

  return {
    title: "오프라인 - InfoBox",
    description: "인터넷 연결이 없습니다. 오프라인 모드로 전환되었습니다.",
    openGraph: {
      title: "오프라인 - InfoBox",
      description: "인터넷 연결이 없습니다. 오프라인 모드로 전환되었습니다.",
      type: "website",
      url: `${BASE_URL}/offline`,
    },
    alternates: {
      canonical: `${BASE_URL}/offline`,
    },
  }
}

export default function OfflinePage() {
  return (
    <Suspense fallback={<div className="container py-20 text-center">로딩 중...</div>}>
      <OfflineClientPage />
    </Suspense>
  )
}
