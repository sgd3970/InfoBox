import AdminNewPostClient from "./client"
import Loading from "../../loading"
import AdminAuthCheck from "../../admin-auth-check"
import { Metadata } from "next"

export const dynamic = "force-dynamic"

export async function generateMetadata(): Promise<Metadata> {
  const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://example.com'

  return {
    title: "새 포스트 작성 - InfoBox",
    description: "InfoBox에 새 포스트를 작성하세요.",
    openGraph: {
      title: "새 포스트 작성 - InfoBox",
      description: "InfoBox에 새 포스트를 작성하세요.",
      type: "website",
      url: `${BASE_URL}/admin/posts/new`,
    },
    alternates: {
      canonical: `${BASE_URL}/admin/posts/new`,
    },
  }
}

export default async function AdminNewPostPage() {
  return (
    <AdminAuthCheck>
      <AdminNewPostClient />
    </AdminAuthCheck>
  )
} 