import { Suspense } from "react"
import AboutClient from "./client"
import { Metadata } from "next"

// 동적 렌더링 설정 추가
export const dynamic = "force-dynamic"

export async function generateMetadata(): Promise<Metadata> {
  const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://example.com'

  return {
    title: "소개 - 트렌드 스캐너",
    description: "트렌드 스캐너에 대해 알아보세요.",
    openGraph: {
      title: "소개 - 트렌드 스캐너",
      description: "트렌드 스캐너에 대해 알아보세요.",
      type: "website",
      url: `${BASE_URL}/about`,
    },
    alternates: {
      canonical: `${BASE_URL}/about`,
    },
  }
}

export default function AboutPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AboutClient />
    </Suspense>
  )
}
