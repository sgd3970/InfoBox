import { Suspense } from "react"
import AdminPostsClient from "./client"
import Loading from "./loading"
import { Metadata } from "next"

export const dynamic = "force-dynamic"

export async function generateMetadata(): Promise<Metadata> {
  const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://example.com'

  return {
    title: "포스트 관리 - InfoBox",
    description: "InfoBox 포스트를 관리하세요.",
    openGraph: {
      title: "포스트 관리 - InfoBox",
      description: "InfoBox 포스트를 관리하세요.",
      type: "website",
      url: `${BASE_URL}/admin/posts`,
    },
    alternates: {
      canonical: `${BASE_URL}/admin/posts`,
    },
  }
}

export default function AdminPostsPage() {
  return (
    <Suspense fallback={<Loading />}>
      <AdminPostsClient />
    </Suspense>
  )
}
