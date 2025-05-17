"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface Recommendation {
  title: string
  description: string
  url: string
}

interface AIContentRecommendationsProps {
  currentPostSlug: string
  currentPostCategory: string
  currentPostTags?: string[]
}

export function AIContentRecommendations({
  currentPostSlug,
  currentPostCategory,
  currentPostTags = [],
}: AIContentRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generateRecommendations = async () => {
    setLoading(true)
    setError(null)

    try {
      // 실제 환경에서는 API 호출을 통해 AI 추천을 생성합니다.
      // 여기서는 시뮬레이션을 위해 setTimeout을 사용합니다.
      const searchRes = await fetch("/api/search?limit=50") // 임시로 최대 50개의 포스트를 가져옴

      if (!searchRes.ok) {
        throw new Error("포스트 목록을 가져오는데 실패했습니다.")
      }

      const searchData = await searchRes.json()
      const allPosts: any[] = searchData.posts; // 가져온 포스트 목록 사용

      // 실제 API 호출 예시:
      // const response = await fetch('/api/ai/recommend', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     slug: currentPostSlug,
      //     category: currentPostCategory,
      //     tags: currentPostTags
      //   }),
      // });
      // const data = await response.json();
      // if (!response.ok) throw new Error(data.message || '추천 생성에 실패했습니다.');
      // setRecommendations(data.recommendations);

      // 시뮬레이션된 추천 (태그와 카테고리 기반)
      const otherPosts = allPosts.filter((post) => post.slug !== currentPostSlug)

      // 태그 기반 점수 계산
      const postsWithScore = otherPosts.map((post) => {
        let score = 0

        // 같은 카테고리면 점수 추가
        if (post.category.toLowerCase() === currentPostCategory.toLowerCase()) {
          score += 3
        }

        // 태그가 일치할 때마다 점수 추가
        const postTags = post.tags || []
        currentPostTags.forEach((tag) => {
          if (postTags.some((t: string) => t.toLowerCase() === tag.toLowerCase())) {
            score += 2
          }
        })

        // 랜덤 요소 추가 (AI 추천 시뮬레이션)
        score += Math.random() * 2

        return { post, score }
      })

      // 점수에 따라 정렬하고 상위 3개 선택
      const recommendedPosts = postsWithScore
        .sort((a, b) => b.score - a.score)
        .slice(0, 3)
        .map((item) => ({
          title: item.post.title,
          description: item.post.description || "",
          url: `/blog/${item.post.category.toLowerCase()}/${item.post.slug}`,
        }))

      setRecommendations(recommendedPosts)
    } catch (err) {
      setError(err instanceof Error ? err.message : "추천 생성에 실패했습니다.")
    } finally {
      setLoading(false)
    }
  }

  // 컴포넌트 마운트 시 자동으로 추천 생성
  useEffect(() => {
    generateRecommendations()
  }, [currentPostSlug])

  if (recommendations.length === 0 && !loading && !error) {
    return null
  }

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold">AI 추천 콘텐츠</h3>
        {!loading && (
          <Button variant="ghost" size="sm" onClick={generateRecommendations}>
            새로고침
          </Button>
        )}
      </div>

      {loading && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
          <p>추천 콘텐츠 생성 중...</p>
        </div>
      )}

      {error && (
        <div className="text-red-500 py-2">
          <p>{error}</p>
          <Button variant="outline" size="sm" onClick={generateRecommendations} className="mt-2">
            다시 시도
          </Button>
        </div>
      )}

      {recommendations.length > 0 && !loading && (
        <Card className="mb-8">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">추천 콘텐츠</CardTitle>
            <CardDescription>AI가 추천하는 관련 콘텐츠입니다.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {recommendations.map((recommendation, index) => (
                <li key={index} className="text-sm">
                  <Link href={recommendation.url} className="font-medium hover:underline">
                    {recommendation.title}
                  </Link>
                  <p className="text-muted-foreground">{recommendation.description}</p>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
