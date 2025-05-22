import AdminCategoriesClient from "./client"
import type { Metadata } from "next"

export const dynamic = "force-dynamic"

export async function generateMetadata(): Promise<Metadata> {
  const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://example.com'

  return {
    title: "카테고리 관리 - InfoBox",
    description: "InfoBox 카테고리를 관리하세요.",
    openGraph: {
      title: "카테고리 관리 - InfoBox",
      description: "InfoBox 카테고리를 관리하세요.",
      type: "website",
      url: `${BASE_URL}/admin/categories`,
    },
    alternates: {
      canonical: `${BASE_URL}/admin/categories`,
    },
  }
}

export default async function AdminCategoriesPage() {
  // Server Component에서 데이터 fetching 로직 제거

  return (
    // AdminCategoriesClient에서 데이터 fetching
    <AdminCategoriesClient />
  )
} 