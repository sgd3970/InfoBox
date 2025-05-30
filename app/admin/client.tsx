"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import Link from "next/link"

interface AdminDashboardClientProps {
  siteStats: any; // 또는 실제 통계 데이터 타입으로 정의
}

export default function AdminDashboardClient({ siteStats }: AdminDashboardClientProps) {
  const [stats, setStats] = useState<any>(siteStats)
  const [loading, setLoading] = useState(!siteStats)

  useEffect(() => {
    if (!siteStats) {
      async function fetchStats() {
        try {
          setLoading(true)
          const res = await fetch("/api/stats")
          if (!res.ok) throw new Error("통계 데이터를 가져오는데 실패했습니다")
          const data = await res.json()
          setStats(data)
        } catch (error) {
          console.error("통계 데이터 가져오기 오류:", error)
        } finally {
          setLoading(false)
        }
      }

      fetchStats()
    }
  }, [siteStats])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="text-center py-10">
        <p>통계 데이터를 불러올 수 없습니다.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">개요</h2>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* 총 포스트 */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">총 포스트</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.overview.totalPosts}</div>
          </CardContent>
        </Card>

        {/* 총 카테고리 */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">총 카테고리</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.overview.totalCategories}</div>
          </CardContent>
        </Card>

        {/* 총 태그 */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">총 태그</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.overview.totalTags}</div>
          </CardContent>
        </Card>

        {/* 총 사용자 */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">총 사용자</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.overview.totalUsers}</div>
          </CardContent>
        </Card>

        {/* 총 댓글 */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">총 댓글</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.overview.totalComments}</div>
          </CardContent>
        </Card>

        {/* 총 조회수 */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">총 조회수</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.overview.totalViews.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      {/* 최근 활동 */}
      <h2 className="text-2xl font-bold mt-8">최근 활동</h2>

      <Card>
        <CardHeader>
          <CardTitle>최근 포스트</CardTitle>
          <CardDescription>최근에 작성된 포스트 목록입니다.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.recentPosts.map((post: any) => (
              <div key={post._id} className="flex items-center justify-between border-b pb-2">
                <div>
                  <h3 className="font-medium">{post.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {post.category} • {new Date(post.date).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`/blog/${typeof post.category === 'string' ? post.category.toLowerCase() : post.category?.slug.toLowerCase()}/${post.slug}`}
                    className="text-primary hover:underline"
                    target="_blank"
                  >
                    보기
                  </Link>
                  <Link href={`/admin/posts/edit/${post.slug}`} className="text-sm text-primary hover:underline">
                    편집
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 통계 차트 및 기타 정보는 AdminAnalyticsClient에서 표시 */}
    </div>
  )
}
