import { allPosts } from "@/lib/posts"
import type { MetadataRoute } from "next"

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://example.com"

  // 정적 페이지
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog/categories`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/blog/tags`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/search`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.6,
    },
  ] as MetadataRoute.Sitemap

  // 블로그 포스트 페이지
  const postPages = allPosts.map((post) => ({
    url: `${baseUrl}/blog/${post.category.toLowerCase()}/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: "monthly",
    priority: 0.8,
  })) as MetadataRoute.Sitemap

  // 카테고리 페이지
  const categories = [...new Set(allPosts.map((post) => post.category.toLowerCase()))]
  const categoryPages = categories.map((category) => ({
    url: `${baseUrl}/blog/category/${category}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.7,
  })) as MetadataRoute.Sitemap

  // 태그 페이지
  const tags = [...new Set(allPosts.flatMap((post) => post.tags || []).map((tag) => tag.toLowerCase()))]
  const tagPages = tags.map((tag) => ({
    url: `${baseUrl}/blog/tag/${tag}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.6,
  })) as MetadataRoute.Sitemap

  return [...staticPages, ...postPages, ...categoryPages, ...tagPages]
}
