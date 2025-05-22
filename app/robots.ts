import type { MetadataRoute } from "next"

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://example.com'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/api/", "/login", "/register", "/profile"],
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  }
} 
