"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function AIContentSummary({ content }: { content: string }) {
  const [summary, setSummary] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const generateSummary = async () => {
    setLoading(true)
    try {
      // 실제 API 호출 대신 간단한 요약 생성
      setTimeout(() => {
        setSummary(
          "이 글은 주요 개념과 아이디어를 설명하고 있습니다. 핵심 내용으로는 첫째, 기본 원리에 대한 설명, 둘째, 실제 적용 사례, 셋째, 미래 전망에 대한 논의가 포함되어 있습니다.",
        )
        setLoading(false)
      }, 1500)
    } catch (error) {
      console.error("요약 생성 중 오류 발생:", error)
      setLoading(false)
    }
  }

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="text-xl">AI 콘텐츠 요약</CardTitle>
        <CardDescription>이 글의 핵심 내용을 AI가 요약해 드립니다.</CardDescription>
      </CardHeader>
      <CardContent>
        {summary ? (
          <div className="text-sm leading-relaxed">{summary}</div>
        ) : (
          <div className="flex justify-center">
            <Button onClick={generateSummary} disabled={loading}>
              {loading ? "요약 생성 중..." : "AI 요약 생성하기"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// 이전 버전과의 호환성을 위해 AiContentSummary도 내보냅니다
export const AiContentSummary = AIContentSummary
