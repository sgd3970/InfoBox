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
    <div className="min-h-screen bg-background">
      <div className="container py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">
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

            return (
              <Link
                key={tag}
                href={`/blog/tags/${encodeURIComponent(tag)}`}
                className={cn(
                  "px-6 py-3 rounded-full transition-all duration-300 transform hover:scale-105",
                  "bg-card hover:bg-accent/5",
                  "border border-border hover:border-border/50",
                  fontSize,
                )}
                style={{
                  animationDelay: `${index * 50}ms`,
                }}
              >
                <span className="font-medium">{tag}</span>
                <span className="ml-2 text-sm text-muted-foreground">({count})</span>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
