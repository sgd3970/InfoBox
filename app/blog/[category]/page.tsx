export const dynamic = 'force-dynamic';

import Link from "next/link"
import Image from "next/image"
import type { Post } from "@/lib/models"

interface CategoryPageProps {
  params: {
    category: string
  }
}

async function getPostsByCategory(category: string): Promise<Post[]> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/posts/category/${category}`, {})
    
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

export default async function CategoryPage({ params }: CategoryPageProps) {
  const posts = await getPostsByCategory(params.category)

  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-6">카테고리: {params.category}</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {posts.map(post => (
          <Link key={post.slug} href={`/blog/${post.category}/${post.slug}`} className="block">
            <div className="rounded-lg border shadow-sm overflow-hidden">
              {post.image && (
                <Image
                  src={post.image}
                  alt={post.title}
                  width={800}
                  height={400}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-4">
                <h2 className="text-xl font-semibold mb-2">{post.title}</h2>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">{post.description}</p>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  <span>{new Date(post.date).toLocaleDateString()}</span>
                  <span className="mx-2">•</span>
                  <span>{post.category}</span>
                  {/* 태그 표시 추가 */}
                  {post.tags && post.tags.length > 0 && (
                      <>
                        <span className="mx-2">•</span>
                        <span>{post.tags.join(', ')}</span>
                      </>
                  )}
                </div>
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