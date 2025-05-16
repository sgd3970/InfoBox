"use client"

// 클라이언트 컴포넌트로 분리하고 useSearchParams 사용 부분 수정
export default function AmpContent({
  content,
  category,
  slug,
}: {
  content: string
  category: string
  slug: string
}) {
  // useSearchParams() 훅 제거 - 실제로 사용하지 않으므로 제거해도 됨

  return (
    <div className="amp-content">
      <div dangerouslySetInnerHTML={{ __html: content }} />
    </div>
  )
}
