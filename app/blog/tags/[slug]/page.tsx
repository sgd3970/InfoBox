export const dynamic = 'force-dynamic';

import Link from "next/link"
import Image from "next/image"
import type { Post } from "@/lib/models"

interface TagPageProps {
  params: {
    slug: string
  }
}

async function getPostsByTag(tagSlug: string): Promise<Post[]> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/posts/tag/${tagSlug}`, {})

    if (!res.ok) {
      console.error(`태그 ${tagSlug} 포스트 API 호출 실패:`, res.status)
      return []
    }

    const posts = await res.json()
    return posts as Post[]
  } catch (error) {
    console.error(`태그 ${tagSlug} 포스트 fetch 오류:`, error)
    return []
  }
}

export default async function TagPage({ params }: TagPageProps) {
  const posts = await getPostsByTag(params.slug)

  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-6">태그: {params.slug}</h1>
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
        <p className="text-center text-gray-500 dark:text-gray-400">해당 태그에 포스트가 없습니다.</p>
      )}
    </div>
  )
} 