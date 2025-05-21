"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Loader2, RefreshCw, Database, Server, Search } from "lucide-react"
import {
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
import { useToast } from "@/components/ui/use-toast"

export function AdminPerformanceClient() {
  const [activeTab, setActiveTab] = useState("database")
  const [loading, setLoading] = useState(true)
  const [performanceData, setPerformanceData] = useState<any>(null)
  const [isRevalidating, setIsRevalidating] = useState(false)
  const { toast } = useToast()

  // 성능 데이터 가져오기
  const fetchPerformanceData = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/admin/performance")
      if (!res.ok) throw new Error("성능 데이터를 가져오는데 실패했습니다")
      const data = await res.json()
      setPerformanceData(data)
    } catch (error) {
      console.error("성능 데이터 가져오기 오류:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleRevalidate = async (path: string) => {
    setIsRevalidating(true)
    try {
      const response = await fetch("/api/revalidate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ path }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "캐시 갱신 중 오류가 발생했습니다.")
      }

      const result = await response.json()
      toast({
        title: "성공",
        description: result.message,
      })
    } catch (error) {
      toast({
        title: "오류",
        description: error instanceof Error ? error.message : "캐시 갱신 중 오류가 발생했습니다.",
        variant: "destructive",
      })
    } finally {
      setIsRevalidating(false)
    }
  }

  useEffect(() => {
    fetchPerformanceData()
  }, [])

  // 차트 색상
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!performanceData) {
    return (
      <div className="text-center py-10">
        <p>성능 데이터를 불러올 수 없습니다.</p>
        <Button onClick={fetchPerformanceData} className="mt-4">
          <RefreshCw className="h-4 w-4 mr-2" />
          다시 시도
        </Button>
      </div>
    )
  }

  // 컬렉션 통계 데이터 포맷팅
  const collectionSizeData = Object.entries(performanceData.dbStats.collectionStats || {}).map(
    ([name, stats]: [string, any]) => ({
      name,
      size: Math.round((stats.size / 1024 / 1024) * 100) / 100, // MB 단위로 변환
    }),
  )

  // 인덱스 크기 데이터 포맷팅
  const indexSizeData = Object.entries(performanceData.dbStats.collectionStats || {}).map(
    ([name, stats]: [string, any]) => ({
      name,
      size: Math.round((stats.totalIndexSize / 1024 / 1024) * 100) / 100, // MB 단위로 변환
    }),
  )

  // 쿼리 성능 데이터 포맷팅
  const queryPerformanceData = Object.entries(performanceData.queryPerformance || {}).map(
    ([name, stats]: [string, any]) => ({
      name,
      executionTime: stats.executionTimeMillis,
      docsExamined: stats.totalDocsExamined,
      docsReturned: stats.nReturned,
    }),
  )

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">성능 모니터링</h2>
        <Button onClick={fetchPerformanceData}>
          <RefreshCw className="h-4 w-4 mr-2" />
          새로고침
        </Button>
      </div>

      <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 w-full md:w-[400px]">
          <TabsTrigger value="database">
            <Database className="h-4 w-4 mr-2" />
            데이터베이스
          </TabsTrigger>
          <TabsTrigger value="server">
            <Server className="h-4 w-4 mr-2" />
            서버
          </TabsTrigger>
          <TabsTrigger value="query">
            <Search className="h-4 w-4 mr-2" />
            쿼리 성능
          </TabsTrigger>
        </TabsList>

        {/* 데이터베이스 탭 */}
        <TabsContent value="database" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">데이터 크기</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Math.round((performanceData.dbStats.dbStats.dataSize / 1024 / 1024) * 100) / 100} MB
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">저장소 크기</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Math.round((performanceData.dbStats.dbStats.storageSize / 1024 / 1024) * 100) / 100} MB
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">인덱스 수</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{performanceData.dbStats.dbStats.indexes}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">인덱스 크기</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Math.round((performanceData.dbStats.dbStats.totalIndexSize / 1024 / 1024) * 100) / 100} MB
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>컬렉션 크기</CardTitle>
                <CardDescription>각 컬렉션의 데이터 크기 (MB)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={collectionSizeData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={100} />
                      <Tooltip formatter={(value) => [`${value} MB`, "크기"]} />
                      <Legend />
                      <Bar dataKey="size" name="크기 (MB)" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>인덱스 크기</CardTitle>
                <CardDescription>각 컬렉션의 인덱스 크기 (MB)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={indexSizeData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={100} />
                      <Tooltip formatter={(value) => [`${value} MB`, "크기"]} />
                      <Legend />
                      <Bar dataKey="size" name="크기 (MB)" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 서버 탭 */}
        <TabsContent value="server" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">RSS 메모리</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{performanceData.memoryUsage?.rss || 0} MB</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">힙 총 크기</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{performanceData.memoryUsage?.heapTotal || 0} MB</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">힙 사용량</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{performanceData.memoryUsage?.heapUsed || 0} MB</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">외부 메모리</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{performanceData.memoryUsage?.external || 0} MB</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>메모리 사용량</CardTitle>
              <CardDescription>서버 메모리 사용량 분석</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: "힙 사용량", value: performanceData.memoryUsage?.heapUsed || 0 },
                        {
                          name: "힙 여유 공간",
                          value:
                            (performanceData.memoryUsage?.heapTotal || 0) -
                            (performanceData.memoryUsage?.heapUsed || 0),
                        },
                        { name: "외부 메모리", value: performanceData.memoryUsage?.external || 0 },
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      nameKey="name"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {[
                        { name: "힙 사용량", value: performanceData.memoryUsage?.heapUsed || 0 },
                        {
                          name: "힙 여유 공간",
                          value:
                            (performanceData.memoryUsage?.heapTotal || 0) -
                            (performanceData.memoryUsage?.heapUsed || 0),
                        },
                        { name: "외부 메모리", value: performanceData.memoryUsage?.external || 0 },
                      ].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} MB`, "메모리"]} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 쿼리 성능 탭 */}
        <TabsContent value="query" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>쿼리 실행 시간</CardTitle>
              <CardDescription>각 쿼리의 실행 시간 (밀리초)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={queryPerformanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${value} ms`, "실행 시간"]} />
                    <Legend />
                    <Bar dataKey="executionTime" name="실행 시간 (ms)" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>검사된 문서 수</CardTitle>
                <CardDescription>각 쿼리에서 검사한 문서 수</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={queryPerformanceData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`${value}`, "문서 수"]} />
                      <Legend />
                      <Bar dataKey="docsExamined" name="검사된 문서 수" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>반환된 문서 수</CardTitle>
                <CardDescription>각 쿼리에서 반환된 문서 수</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={queryPerformanceData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`${value}`, "문서 수"]} />
                      <Legend />
                      <Bar dataKey="docsReturned" name="반환된 문서 수" fill="#ffc658" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>쿼리 효율성</CardTitle>
              <CardDescription>검사된 문서 대비 반환된 문서 비율</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {queryPerformanceData.map((query: any) => {
                  const efficiency =
                    query.docsExamined > 0 ? Math.round((query.docsReturned / query.docsExamined) * 100) : 100

                  return (
                    <div key={query.name} className="space-y-2">
                      <div className="flex justify-between">
                        <span className="font-medium">{query.name}</span>
                        <span className="text-muted-foreground">{efficiency}% 효율</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full rounded-full bg-primary" style={{ width: `${efficiency}%` }}></div>
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>검사: {query.docsExamined}</span>
                        <span>반환: {query.docsReturned}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>캐시 관리</CardTitle>
          <CardDescription>
            각 페이지의 캐시를 수동으로 갱신할 수 있습니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="flex flex-col gap-2">
              <h3 className="text-sm font-medium">메인 페이지</h3>
              <Button
                variant="outline"
                onClick={() => handleRevalidate("/")}
                disabled={isRevalidating}
              >
                {isRevalidating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    갱신 중...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    메인 페이지 캐시 갱신
                  </>
                )}
              </Button>
            </div>

            <div className="flex flex-col gap-2">
              <h3 className="text-sm font-medium">블로그 목록</h3>
              <Button
                variant="outline"
                onClick={() => handleRevalidate("/blog")}
                disabled={isRevalidating}
              >
                {isRevalidating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    갱신 중...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    블로그 목록 캐시 갱신
                  </>
                )}
              </Button>
            </div>

            <div className="flex flex-col gap-2">
              <h3 className="text-sm font-medium">카테고리 목록</h3>
              <Button
                variant="outline"
                onClick={() => handleRevalidate("/blog/categories")}
                disabled={isRevalidating}
              >
                {isRevalidating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    갱신 중...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    카테고리 목록 캐시 갱신
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
