import { Suspense } from "react"
import TagsClient, { type TagData } from "./client"
import type { Post } from "@/lib/models"
import { Metadata } from "next"

export const dynamic = "force-dynamic"

export async function generateMetadata(): Promise<Metadata> {
  const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://example.com'

  return {
    title: "태그 - InfoBox",
    description: "모든 태그 목록을 확인하세요.",
    openGraph: {
      title: "태그 - InfoBox",
      description: "모든 태그 목록을 확인하세요.",
      type: "website",
      url: `${BASE_URL}/blog/tags`,
    },
    alternates: {
      canonical: `${BASE_URL}/blog/tags`,
    },
  }
}

export default async function TagsPage() {
  // 모든 포스트 가져오기
  let allPosts = [];
  try {
    const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://example.com'
    const url = new URL('/api/search?limit=1000', BASE_URL).toString()
    const searchRes = await fetch(url, {})
    if (searchRes.ok) {
      const searchData = await searchRes.json();
      allPosts = searchData.results || [];
    } else {
      console.error("포스트 목록 가져오기 실패", searchRes.status);
    }
  } catch (error) {
    console.error("포스트 목록 가져오는 중 오류 발생:", error);
    allPosts = [];
  }

  // 모든 태그 수집 및 카운트
  const tagCounts: Record<string, number> = {}

  allPosts.forEach((post: Post) => {
    if (post.tags) {
      post.tags.forEach((tag) => {
        if (tag && typeof tag === 'object' && 'name' in tag) {
          const normalizedTag = tag.name.toLowerCase()
          tagCounts[normalizedTag] = (tagCounts[normalizedTag] || 0) + 1
        }
      })
    }
  })

  // 태그를 알파벳 순으로 정렬
  const sortedTags = Object.entries(tagCounts).sort((a, b) => a[0].localeCompare(b[0]))

  // 최대 빈도수 계산
  const maxCount = Math.max(...sortedTags.map(([_, count]) => count))

  // 클라이언트 컴포넌트에 전달할 데이터 준비
  const tagsData: TagData[] = sortedTags.map(([tag, count]) => ({
    tag,
    count,
    maxCount,
  }))

  return (
    <div className="container py-10">
      <Suspense
        fallback={
          <div className="flex flex-wrap gap-4">
            {Array.from({ length: 20 }).map((_, i) => (
              <div key={i} className="h-10 w-24 rounded-full bg-muted animate-pulse" />
            ))}
          </div>
        }
      >
        <TagsClient tags={tagsData} />
      </Suspense>
    </div>
  )
}
