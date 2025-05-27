"use client"

import Link from "next/link"
import { cn } from "@/lib/utils"
import { useSearchParams } from "next/navigation"

export interface TagData {
  tag: string
  count: number
  maxCount: number
}

export default function TagsClient({ tags }: { tags: TagData[] }) {
  const searchParams = useSearchParams()
  const filter = searchParams.get("filter")?.toLowerCase() || ""

  // 필터링된 태그 목록
  const filteredTags = filter ? tags.filter(({ tag }) => tag.toLowerCase().includes(filter)) : tags

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
      <div className="container py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
            태그
          </h1>
          <p className="text-muted-foreground text-lg">
            관심 있는 주제를 선택하여 관련 콘텐츠를 탐색하세요
          </p>
        </div>

        <div className="flex flex-wrap gap-4 justify-center">
          {filteredTags.map(({ tag, count, maxCount }, index) => {
            // 태그 빈도수에 따라 크기 조정 (1-5 사이의 값)
            const size = Math.max(1, Math.ceil((count / maxCount) * 5))
            const fontSize = {
              1: "text-sm",
              2: "text-base",
              3: "text-lg",
              4: "text-xl",
              5: "text-2xl",
            }[size]

            // 태그 빈도수에 따라 색상 강도 조정
            const colorIntensity = Math.max(0.1, Math.min(0.9, count / maxCount))
            const bgColor = `rgba(99, 102, 241, ${colorIntensity * 0.1})`
            const textColor = `rgba(99, 102, 241, ${colorIntensity * 0.9})`

            return (
              <Link
                key={tag}
                href={`/blog/tag/${encodeURIComponent(tag)}`}
                className={cn(
                  "px-6 py-3 rounded-full transition-all duration-300 transform hover:scale-110 hover:shadow-lg",
                  "border-2 border-indigo-200 hover:border-indigo-400",
                  "backdrop-blur-sm",
                  fontSize,
                )}
                style={{
                  backgroundColor: bgColor,
                  color: textColor,
                  animationDelay: `${index * 50}ms`,
                }}
              >
                <span className="font-medium">{tag}</span>
                <span className="ml-2 text-sm opacity-75">({count})</span>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
