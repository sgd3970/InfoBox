import { MetadataRoute } from 'next'
import type { Post } from '@/lib/models'; // Post 타입 임포트

// 모든 포스트를 가져오는 함수 (sitemap 생성용)
async function getAllPostsForSitemap(): Promise<Post[]> {
  try {
    const searchRes = await fetch(`https://www.trend-scanner.com/api/search?limit=9999`); // 절대 경로 사용
    if (searchRes.ok) {
      const searchData = await searchRes.json();
      return searchData.posts || [];
    } else {
      console.error("Sitemap 포스트 목록 가져오기 실패", searchRes.status);
      return [];
    }
  } catch (error) {
    console.error("Sitemap 포스트 목록 가져오는 중 오류 발생:", error);
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://example.com"

  // 정적 페이지
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog/categories`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/blog/tags`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/search`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    },
  ] as const

  // 블로그 포스트 페이지
  const posts = await getAllPostsForSitemap();

  const postEntries = posts.map((post) => ({
    url: `${baseUrl}/blog/${post.category.toLowerCase()}/${post.slug}`,
    lastModified: new Date(post.date).toISOString(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }))

  // 카테고리 페이지
  const categories = [...new Set(posts.map((post) => post.category.toLowerCase()))]
  const categoryPages = categories.map((category) => ({
    url: `${baseUrl}/blog/category/${category}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }))

  // 태그 페이지
  const tags = [...new Set(posts.flatMap((post) => post.tags || []).map((tag) => tag.toLowerCase()))]
  const tagPages = tags.map((tag) => ({
    url: `${baseUrl}/blog/tag/${tag}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }))

  return [...staticPages, ...postEntries, ...categoryPages, ...tagPages]
}
