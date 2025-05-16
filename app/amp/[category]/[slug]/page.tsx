import { Suspense } from "react"
import AmpContent from "./client"

// 동적 렌더링 설정 추가
export const dynamic = "force-dynamic"

export default async function AmpPage({
  params,
}: {
  params: { category: string; slug: string }
}) {
  // 여기서 AMP 콘텐츠를 가져오는 로직...
  const content = `<h1>AMP 콘텐츠: ${params.category}/${params.slug}</h1>`

  return (
    <Suspense fallback={<div>Loading AMP content...</div>}>
      <AmpContent content={content} category={params.category} slug={params.slug} />
    </Suspense>
  )
}
