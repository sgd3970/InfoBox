export const dynamic = 'force-dynamic';

import Link from "next/link"
import Image from "next/image"
import type { Post } from "@/lib/models"
import { Metadata } from "next"
import { getDatabase } from "@/lib/mongodb"

interface TagPageProps {
  params: {
    slug: string
  }
}

async function getPostsByTag(tagSlug: string): Promise<Post[]> {
  try {
    console.log('[TagPage] getPostsByTag 호출:', tagSlug)
    const BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';
    const res = await fetch(`${BASE_URL}/api/posts/tag/${tagSlug}`, {
      cache: 'no-store'
    })

    if (!res.ok) {
      console.error(`[TagPage] 태그 ${tagSlug} 포스트 API 호출 실패:`, res.status)
      return []
    }

    const posts = await res.json()
    console.log('[TagPage] getPostsByTag posts:', posts.length, (posts as any[]).map((p: any) => p.tags))
    return posts as Post[]
  } catch (error) {
    console.error(`[TagPage] 태그 ${tagSlug} 포스트 fetch 오류:`, error)
    return []
  }
}

async function getTagNameBySlug(slug: string): Promise<string> {
  console.log('[TagPage] getTagNameBySlug 호출:', slug)
  const db = await getDatabase();
  const tag = await db.collection("tags").findOne({ slug });
  console.log('[TagPage] getTagNameBySlug 결과:', tag)
  return tag?.name || slug;
}

export default async function TagPage({ params }: TagPageProps) {
  console.log('[TagPage] TagPage 진입:', params.slug)
  const posts = await getPostsByTag(params.slug)
  const tagName = await getTagNameBySlug(params.slug)
  console.log('[TagPage] posts:', posts.length, (posts as any[]).map((p: any) => p.tags))
  console.log('[TagPage] tagName:', tagName)

  return (
    <div className="container py-8">      
      <h1 className="text-3xl font-bold mb-8">#{tagName}</h1>
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
                  <span>{
                    typeof post.category === 'object' && post.category !== null ? post.category.name : post.category
                  }</span>
                  {Array.isArray(post.tags) && post.tags.length > 0 && (
                    <>
                      <span className="mx-2">•</span>
                      <span>{
                        post.tags.map(tag => 
                          typeof tag === 'object' && tag !== null ? tag.name : tag
                        ).join(', ')
                      }</span>
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

export async function generateMetadata({ params }: TagPageProps): Promise<Metadata> {
  const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://example.com'
  const tagSlug = params.slug
  const tagName = await getTagNameBySlug(tagSlug)

  return {
    title: `#${tagName} - InfoBox`,
    description: `${tagName} 태그와 관련된 모든 게시물을 확인하세요.`,
    openGraph: {
      title: `#${tagName} - InfoBox`,
      description: `${tagName} 태그와 관련된 모든 게시물을 확인하세요.`,
      type: "website",
      url: `${BASE_URL}/blog/tags/${tagSlug}`,
    },
    alternates: {
      canonical: `${BASE_URL}/blog/tags/${tagSlug}`,
    },
  }
} 
