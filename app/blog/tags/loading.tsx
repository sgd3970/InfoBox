import { Skeleton } from "@/components/ui/skeleton"

export default function TagsLoading() {
  return (
    <div className="container py-10">
      <h1 className="text-4xl font-bold mb-8">태그</h1>

      <div className="flex flex-wrap gap-4">
        {Array.from({ length: 20 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-24 rounded-full" />
        ))}
      </div>
    </div>
  )
}
