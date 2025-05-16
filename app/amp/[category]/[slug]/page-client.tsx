"use client"

import { useSearchParams } from "next/navigation"

export function AmpPageClient({ ampContent }: { ampContent: string }) {
  // useSearchParams를 사용하지만 실제로는 사용하지 않음
  // 이 컴포넌트가 클라이언트 컴포넌트임을 명시하기 위해 추가
  const searchParams = useSearchParams()

  return <div dangerouslySetInnerHTML={{ __html: ampContent }} />
}
