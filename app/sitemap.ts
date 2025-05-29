import { MetadataRoute } from 'next'
import type { Post } from '@/lib/models'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://example.com'

// 모든 포스트를 가져오는 함수 (sitemap 생성용)
async function getAllPostsForSitemap(): Promise<Post[]> {
  try {
    const url = new URL('/api/search?limit=9999', BASE_URL).toString()
    const searchRes = await fetch(url)
    if (searchRes.ok) {
      const searchData = await searchRes.json()
      return searchData.posts || []
    } else {
      console.error("Sitemap 포스트 목록 가져오기 실패", searchRes.status)
      return []
    }
  } catch (error) {
    console.error("Sitemap 포스트 목록 가져오는 중 오류 발생:", error)
    return []
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // 정적 페이지
  const staticPages = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/blog`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/blog/categories`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/blog/tags`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/search`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    },
  ] as const

  // 블로그 포스트 페이지
  const posts = await getAllPostsForSitemap()

  const postEntries = posts.map((post) => ({
    url: `${BASE_URL}/blog/${post.category.toLowerCase()}/${post.slug}`,
    lastModified: new Date(post.date).toISOString(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }))

  // 카테고리 페이지
  const categories = [...new Set(posts.map((post) => post.category.toLowerCase()))]
  const categoryPages = categories.map((category) => ({
    url: `${BASE_URL}/blog/category/${category}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }))

  // 태그 페이지
  const tags = [...new Set(posts.flatMap((post) => post.tags || []).map((tag) => tag.slug.toLowerCase()))]
  const tagPages = tags.map((tag) => ({
    url: `${BASE_URL}/blog/tags/${tag}`,
    lastModified: new Date(),
  }))

  return [...staticPages, ...postEntries, ...categoryPages, ...tagPages]
}
