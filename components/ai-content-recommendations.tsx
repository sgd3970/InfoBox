"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { Post } from "@/lib/models"

interface Recommendation {
  title: string
  description: string
  url: string
}

interface AIContentRecommendationsProps {
  currentPostSlug: string
  currentPostCategory: string
  currentPostTags?: { name: string; slug: string }[]
}

interface PostWithScore {
  post: Post
  score: number
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
      const BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';
      const searchRes = await fetch(`${BASE_URL}/api/search?limit=50`);

      if (!searchRes.ok) {
        throw new Error("포스트 목록을 가져오는데 실패했습니다.")
      }

      const searchData = await searchRes.json()
      const allPosts = (searchData.results || []) as Post[];

      const otherPosts = allPosts.filter((post: Post) => post.slug !== currentPostSlug)

      // 태그 기반 점수 계산
      const postsWithScore = otherPosts.map((post: Post): PostWithScore => {
        let score = 0

        // 같은 카테고리면 점수 추가
        if (post.category?.toLowerCase() === currentPostCategory.toLowerCase()) {
          score += 3
        }

        // 태그가 일치할 때마다 점수 추가
        const postTags = post.tags || []
        currentPostTags.forEach((tag) => {
          if (postTags.some((t) => t.slug.toLowerCase() === tag.slug.toLowerCase())) {
            score += 2
          }
        })

        // 랜덤 요소 추가 (AI 추천 시뮬레이션)
        score += Math.random() * 2

        return { post, score }
      })

      // 점수에 따라 정렬하고 상위 3개 선택
      const recommendedPosts = postsWithScore
        .sort((a: PostWithScore, b: PostWithScore) => b.score - a.score)
        .slice(0, 3)
        .map((item: PostWithScore) => ({
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
