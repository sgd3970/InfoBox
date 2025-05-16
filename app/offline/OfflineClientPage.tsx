"use client"
import { Button } from "@/components/ui/button"
import { WifiOff } from "lucide-react"

export default function OfflineClientPage() {
  // 클라이언트 컴포넌트이지만 useSearchParams()를 직접 사용하지 않음
  return (
    <div className="container py-20">
      <div className="max-w-md mx-auto text-center">
        <div className="flex justify-center mb-6">
          <WifiOff className="h-16 w-16 text-muted-foreground" />
        </div>
        <h1 className="text-3xl font-bold mb-4">오프라인 상태입니다</h1>
        <p className="text-muted-foreground mb-8">
          인터넷 연결이 끊어졌습니다. 이 페이지는 오프라인 모드에서 제공됩니다. 인터넷에 다시 연결되면 정상적으로
          사이트를 이용할 수 있습니다.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild>
            <a href="/">홈으로 이동</a>
          </Button>
          <Button variant="outline" onClick={() => window.location.reload()}>
            새로고침
          </Button>
        </div>
      </div>
    </div>
  )
}
