export const dynamic = 'force-dynamic';

import Link from "next/link"
import Image from "next/image"
import type { Post } from "@/lib/models"
import { Metadata } from "next"
import { PostThumbnail } from "@/components/PostThumbnail";

interface CategoryPageProps {
  params: {
    category: string
  }
}

async function getPostsByCategory(category: string): Promise<Post[]> {
  try {
    const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://example.com'
    const res = await fetch(`${BASE_URL}/api/posts/category/${category}`, {})
    
    if (!res.ok) {
      console.error(`카테고리 ${category} 포스트 API 호출 실패:`, res.status)
      return []
    }

    const posts = await res.json()
    return posts as Post[]
  } catch (error) {
    console.error(`카테고리 ${category} 포스트 fetch 오류:`, error)
    return []
  }
}

async function getCategoryInfo(category: string) {
  try {
    const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://example.com'
    const res = await fetch(`${BASE_URL}/api/categories`, {})
    if (!res.ok) return null
    const categories = await res.json()
    return categories.find((c: { slug: string }) => c.slug === category)
  } catch (error) {
    console.error("카테고리 정보 가져오기 오류:", error)
    return null
  }
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const posts = await getPostsByCategory(params.category)

  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-6">카테고리: {params.category}</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {posts.map(post => (
          <Link key={post.slug} href={`/blog/${typeof post.category === 'string' ? post.category.toLowerCase() : post.category?.slug.toLowerCase()}/${post.slug}`} className="group rounded-lg bg-white dark:bg-zinc-900 shadow-sm hover:shadow-md transition-shadow border overflow-hidden flex flex-col">
            <div className="relative aspect-video w-full overflow-hidden">
              <PostThumbnail
                src={post.featuredImage || post.image || ''}
                alt={post.title}
                width={800}
                height={400}
                className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
              />
            </div>
            <div className="flex-1 flex flex-col p-4 gap-2">
              <h2 className="text-xl font-semibold mb-1 line-clamp-2">{post.title}</h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-2 line-clamp-2">{post.description}</p>
              <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-auto">
                <span>{new Date(post.date).toLocaleDateString()}</span>
                <span className="mx-2">•</span>
                <span>{typeof post.category === 'string' ? post.category : post.category?.name}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
      {posts.length === 0 && (
        <p className="text-center text-gray-500 dark:text-gray-400">해당 카테고리에 포스트가 없습니다.</p>
      )}
    </div>
  )
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://example.com'
  const category = params.category.toLowerCase()
  const categoryInfo = await getCategoryInfo(category)

  if (!categoryInfo) {
    return {}
  }

  return {
    title: `${categoryInfo.name} - InfoBox`,
    description: categoryInfo.description || `${categoryInfo.name} 카테고리의 모든 게시물을 확인하세요.`,
    openGraph: {
      title: `${categoryInfo.name} - InfoBox`,
      description: categoryInfo.description || `${categoryInfo.name} 카테고리의 모든 게시물을 확인하세요.`,
      type: "website",
      url: `${BASE_URL}/blog/${category}`,
    },
    alternates: {
      canonical: `${BASE_URL}/blog/${category}`,
    },
  }
} 