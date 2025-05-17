import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-48" /> {/* 제목 스켈레톤 */}
      <Skeleton className="h-10 w-64" /> {/* 슬러그 스켈레톤 */}
      <Skeleton className="h-20 w-full" /> {/* 요약 스켈레톤 */}
      <Skeleton className="h-80 w-full" /> {/* 내용 스켈레톤 */}
      <Skeleton className="h-10 w-32" /> {/* 카테고리 스켈레톤 */}
      <Skeleton className="h-10 w-64" /> {/* 태그 스켈레톤 */}
      <Skeleton className="h-10 w-24" /> {/* 버튼 스켈레톤 */}
    </div>
  )
} 