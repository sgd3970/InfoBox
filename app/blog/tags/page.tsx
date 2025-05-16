import { Suspense } from "react"
import { allPosts } from "@/lib/posts"
import TagsClient, { type TagData } from "./client"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "태그 | InfoBox",
  description: "InfoBox 블로그의 모든 태그를 확인하세요.",
}

export default function TagsPage() {
  // 모든 태그 수집 및 카운트
  const tagCounts: Record<string, number> = {}

  allPosts.forEach((post) => {
    if (post.tags) {
      post.tags.forEach((tag) => {
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
