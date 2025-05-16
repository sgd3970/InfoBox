import Link from "next/link"
import { Badge } from "@/components/ui/badge"

interface Tag {
  name: string
  count: number
}

interface TagCloudProps {
  tags: Tag[]
  maxSize?: number
  minSize?: number
}

export function TagCloud({ tags, maxSize = 1.5, minSize = 0.8 }: TagCloudProps) {
  if (!tags.length) return null

  // 태그 카운트의 최대값과 최소값 찾기
  const maxCount = Math.max(...tags.map((tag) => tag.count))
  const minCount = Math.min(...tags.map((tag) => tag.count))

  // 크기 계산 함수
  const calculateSize = (count: number) => {
    if (maxCount === minCount) return (maxSize + minSize) / 2
    return minSize + ((count - minCount) / (maxCount - minCount)) * (maxSize - minSize)
  }

  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => {
        const size = calculateSize(tag.count)
        return (
          <Link key={tag.name} href={`/blog/tag/${tag.name}`}>
            <Badge
              variant="outline"
              className="cursor-pointer transition-all hover:bg-primary hover:text-primary-foreground"
              style={{ fontSize: `${size}rem` }}
            >
              {tag.name} ({tag.count})
            </Badge>
          </Link>
        )
      })}
    </div>
  )
}
