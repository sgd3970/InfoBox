import { Metadata } from 'next'

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