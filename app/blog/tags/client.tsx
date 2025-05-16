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
    <div className="flex flex-wrap gap-4">
      {filteredTags.map(({ tag, count, maxCount }) => {
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
            href={`/blog/tag/${encodeURIComponent(tag)}`}
            className={cn(
              "px-4 py-2 bg-muted rounded-full hover:bg-primary/10 hover:text-primary transition-colors",
              fontSize,
            )}
          >
            {tag} ({count})
          </Link>
        )
      })}
    </div>
  )
}
