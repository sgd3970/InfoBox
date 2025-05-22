import { Suspense } from "react"
import { SearchClient } from "./client"
import { Metadata } from "next"

// 동적 렌더링 사용
export const dynamic = "force-dynamic"

// 메타데이터 설정
// export const metadata = {
//   title: "검색 - InfoBox",
//   description: "InfoBox에서 원하는 정보를 검색해보세요.",
// }

export async function generateMetadata(): Promise<Metadata> {
  const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://example.com'

  return {
    title: "검색 - InfoBox",
    description: "InfoBox에서 원하는 정보를 검색해보세요.",
    openGraph: {
      title: "검색 - InfoBox",
      description: "InfoBox에서 원하는 정보를 검색해보세요.",
      type: "website",
      url: `${BASE_URL}/search`,
    },
    alternates: {
      canonical: `${BASE_URL}/search`,
    },
  }
}

export default function SearchPage() {
  return (
    <div className="container py-10">
      <h1 className="text-4xl font-bold mb-8">검색</h1>

      <Suspense
        fallback={
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          </div>
        }
      >
        <SearchClient />
      </Suspense>
    </div>
  )
}
