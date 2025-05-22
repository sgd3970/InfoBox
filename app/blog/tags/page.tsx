import { Suspense } from "react"
import TagsClient, { type TagData } from "./client"
import type { Post } from "@/lib/models"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "태그 | InfoBox",
  description: "InfoBox 블로그의 모든 태그를 확인하세요.",
}

export default async function TagsPage() {
  // 모든 포스트 가져오기
  let allPosts = [];
  try {
    const searchRes = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/search?limit=1000`, {}); // 충분히 큰 limit 설정
    if (searchRes.ok) {
      const searchData = await searchRes.json();
      allPosts = searchData.posts || [];
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
      post.tags.forEach((tag: string) => {
        const normalizedTag = tag.toLowerCase()
        tagCounts[normalizedTag] = (tagCounts[normalizedTag] || 0) + 1
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
      <h1 className="text-4xl font-bold mb-8">태그</h1>

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
