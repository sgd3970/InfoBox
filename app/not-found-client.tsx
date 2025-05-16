"use client"

import { useSearchParams } from "next/navigation"
import Link from "next/link"

export function NotFoundClient() {
  const searchParams = useSearchParams()
  const referrer = searchParams.get("from") || ""

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
      <h1 className="text-4xl font-bold mb-4">404 - 페이지를 찾을 수 없습니다</h1>
      <p className="text-xl mb-8">요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.</p>
      {referrer && <p className="mb-8 text-gray-600">참조 페이지: {referrer}</p>}
      <Link href="/" className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
        홈으로 돌아가기
      </Link>
    </div>
  )
}
