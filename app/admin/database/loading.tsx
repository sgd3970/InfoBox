import { Loader2 } from "lucide-react"

export default function Loading() {
  return (
    <div className="flex justify-center items-center min-h-[400px]">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <span className="ml-2">데이터베이스 정보를 불러오는 중...</span>
    </div>
  )
}
