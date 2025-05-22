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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { format } from 'date-fns'

interface AdminAnalyticsClientProps {
  performanceData: any; // 또는 실제 성능 데이터 타입으로 정의
}

export function AdminAnalyticsClient({ performanceData }: AdminAnalyticsClientProps) {
  const [period, setPeriod] = useState("7d")
  const [stats, setStats] = useState<any>(performanceData)
  const [loading, setLoading] = useState(!performanceData)

  useEffect(() => {
    if (!performanceData) {
      async function fetchPerformanceData() {
        try {
          setLoading(true)
          const res = await fetch("/api/admin/performance")
          if (!res.ok) throw new Error("성능 데이터를 가져오는데 실패했습니다")
          const data = await res.json()
          setStats(data)
        } catch (error) {
          console.error("성능 데이터 가져오기 오류:", error)
        } finally {
          setLoading(false)
        }
      }

      fetchPerformanceData()
    }
  }, [performanceData])

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
        <p>성능 데이터를 불러올 수 없습니다.</p>
      </div>
    )
  }

  // 차트 색상
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#A28BFA"]

  // 페이지뷰 데이터 포맷팅
  const pageViewsChartData = stats.pageViewsData.map((item: any) => ({
    date: format(new Date(item.date), 'MM/dd'),
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
        <h2 className="text-2xl font-bold">사이트 분석</h2>
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
          <CardDescription>최근 2주간의 페이지뷰 변화입니다.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={pageViewsChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="views" stroke="#8884d8" activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>트래픽 소스</CardTitle>
          <CardDescription>사이트 방문자의 주요 유입 경로입니다.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={referrerData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>디바이스 통계</CardTitle>
          <CardDescription>사용자의 디바이스별 접속 비율입니다.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex justify-center items-center">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={deviceData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label
                >
                  {deviceData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* 데이터베이스 성능 지표 */}
      {stats?.dbStats && (
        <Card>
          <CardHeader>
            <CardTitle>데이터베이스 성능 지표</CardTitle>
            <CardDescription>MongoDB 연결 및 성능 정보입니다.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium">현재 연결:</p>
                <p>{stats.dbStats.connections?.current || 0}</p>
              </div>
              <div>
                <p className="font-medium">사용 가능한 연결:</p>
                <p>{stats.dbStats.connections?.available || 0}</p>
              </div>
              <div>
                <p className="font-medium">데이터 크기:</p>
                <p>{(stats.dbStats.dataSize / (1024 * 1024)).toFixed(2)} MB</p>
              </div>
              <div>
                <p className="font-medium">스토리지 크기:</p>
                <p>{(stats.dbStats.storageSize / (1024 * 1024)).toFixed(2)} MB</p>
              </div>
              <div>
                <p className="font-medium">총 인덱스 크기:</p>
                <p>{(stats.dbStats.totalIndexSize / (1024 * 1024)).toFixed(2)} MB</p>
              </div>
              <div>
                <p className="font-medium">최대 풀 크기:</p>
                <p>{stats.dbStats.maxPoolSize || 'N/A'}</p>
              </div>
              {/* 필요한 다른 MongoDB 성능 지표 추가 */}
            </div>
          </CardContent>
        </Card>
      )}

    </div>
  )
}