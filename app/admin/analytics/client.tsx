"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from "lucide-react"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

export function AdminAnalyticsClient() {
  const [period, setPeriod] = useState("7d")
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
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
  }, [])

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

  // 차트 색상
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"]

  // 페이지뷰 데이터 포맷팅
  const pageViewsChartData = stats.pageViewsData.map((item: any) => ({
    date: new Date(item.date).toLocaleDateString("ko-KR", { month: "short", day: "numeric" }),
    views: item.count,
  }))

  // 디바이스 데이터 포맷팅
  const deviceData = stats.deviceStats.map((item: any) => ({
    name: item.device === "desktop" ? "데스크톱" : item.device === "mobile" ? "모바일" : "태블릿",
    value: item.count,
  }))

  // 리퍼러 데이터 포맷팅
  const referrerData = stats.topReferrers.map((item: any) => ({
    name: item.source,
    value: item.count,
  }))

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">분석</h2>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="기간 선택" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">최근 7일</SelectItem>
            <SelectItem value="30d">최근 30일</SelectItem>
            <SelectItem value="90d">최근 90일</SelectItem>
            <SelectItem value="1y">최근 1년</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">총 방문자</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.overview.totalViews.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="text-green-500">↑ 12.5%</span> 지난 기간 대비
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">총 포스트</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.overview.totalPosts.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="text-green-500">↑ 8.2%</span> 지난 기간 대비
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">총 댓글</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.overview.totalComments.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="text-red-500">↓ 1.8%</span> 지난 기간 대비
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">총 사용자</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.overview.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="text-green-500">↑ 3.1%</span> 지난 기간 대비
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>페이지뷰 추이</CardTitle>
          <CardDescription>기간별 페이지뷰 변화 추이</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={pageViewsChartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="views"
                  name="페이지뷰"
                  stroke="#8884d8"
                  activeDot={{ r: 8 }}
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>인기 포스트</CardTitle>
            <CardDescription>조회수가 가장 많은 포스트</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={stats.topPosts.map((post: any) => ({
                    name: post.title.length > 20 ? post.title.substring(0, 20) + "..." : post.title,
                    views: post.views,
                  }))}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={150} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="views" name="조회수" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>트래픽 소스</CardTitle>
            <CardDescription>방문자 유입 경로</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={referrerData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {referrerData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value}회`, "방문"]} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>기기별 사용자</CardTitle>
          <CardDescription>사용자가 접속한 기기 유형</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-8">
            <div className="flex-1 h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={deviceData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {deviceData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value}회`, "방문"]} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-4">
              {deviceData.map((device: any, index: number) => {
                const total = deviceData.reduce((sum: number, item: any) => sum + item.value, 0)
                const percentage = Math.round((device.value / total) * 100)

                return (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium">{device.name}</span>
                      <span className="text-muted-foreground">{percentage}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: COLORS[index % COLORS.length],
                        }}
                      ></div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
