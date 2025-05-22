import { Metadata } from 'next'
import { Suspense } from 'react'
import AdminProfileClient from './client'
import AdminAuthCheck from '../admin-auth-check'

export async function generateMetadata(): Promise<Metadata> {
  const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://example.com'

  return {
    title: "프로필 관리 - InfoBox",
    description: "InfoBox 프로필을 관리하세요.",
    openGraph: {
      title: "프로필 관리 - InfoBox",
      description: "InfoBox 프로필을 관리하세요.",
      type: "website",
      url: `${BASE_URL}/admin/profile`,
    },
    alternates: {
      canonical: `${BASE_URL}/admin/profile`,
    },
  }
}

export default function AdminProfilePage() {
  return (
    <AdminAuthCheck>
      <div className="container py-10">
        <h1 className="text-3xl font-bold mb-6">프로필 관리</h1>
        <Suspense fallback={<div className="text-center">로딩 중...</div>}>
          <AdminProfileClient />
        </Suspense>
      </div>
    </AdminAuthCheck>
  )
} 