"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Database, ViewIcon as Index, Shield, RefreshCw } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

export function AdminDatabaseClient() {
  const { auth } = useAuth()
  const [activeTab, setActiveTab] = useState("indexes")
  const [loading, setLoading] = useState(false)
  const [optimizing, setOptimizing] = useState(false)
  const [indexInfo, setIndexInfo] = useState<Record<string, any[]> | null>(null)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  // 인덱스 정보 가져오기
  const fetchIndexInfo = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/admin/index-info")
      if (!res.ok) throw new Error("인덱스 정보를 가져오는데 실패했습니다")
      const data = await res.json()
      setIndexInfo(data.indexInfo)
    } catch (error) {
      console.error("인덱스 정보 가져오기 오류:", error)
      setMessage({ type: "error", text: "인덱스 정보를 가져오는데 실패했습니다." })
    } finally {
      setLoading(false)
    }
  }

  // 인덱스 최적화
  const optimizeIndexes = async () => {
    try {
      setOptimizing(true)
      setMessage(null)

      const res = await fetch("/api/admin/optimize-indexes")
      const data = await res.json()

      if (res.ok) {
        setMessage({ type: "success", text: data.message })
        setIndexInfo(data.indexInfo)
      } else {
        setMessage({ type: "error", text: data.error || "인덱스 최적화에 실패했습니다." })
      }
    } catch (error) {
      console.error("인덱스 최적화 오류:", error)
      setMessage({ type: "error", text: "인덱스 최적화 중 오류가 발생했습니다." })
    } finally {
      setOptimizing(false)
    }
  }

  useEffect(() => {
    if (auth.status === "authenticated" && auth.user?.role === "admin") {
      fetchIndexInfo()
    }
  }, [auth.status, auth.user])

  if (auth.status !== "authenticated" || auth.user?.role !== "admin") {
    return (
      <div className="text-center py-10">
        <p>관리자만 접근할 수 있는 페이지입니다.</p>
      </div>
    )
  }

  return (
    <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab}>
      <TabsList className="grid grid-cols-3 w-full md:w-[400px]">
        <TabsTrigger value="indexes">
          <Index className="h-4 w-4 mr-2" />
          인덱스
        </TabsTrigger>
        <TabsTrigger value="connection">
          <Database className="h-4 w-4 mr-2" />
          연결 관리
        </TabsTrigger>
        <TabsTrigger value="security">
          <Shield className="h-4 w-4 mr-2" />
          보안
        </TabsTrigger>
      </TabsList>

      {/* 인덱스 탭 */}
      <TabsContent value="indexes" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>데이터베이스 인덱스</CardTitle>
            <CardDescription>MongoDB 인덱스를 관리하고 최적화합니다.</CardDescription>
          </CardHeader>
          <CardContent>
            {message && (
              <div
                className={`p-4 rounded-md mb-4 ${message.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}
              >
                {message.text}
              </div>
            )}

            <div className="flex justify-between mb-4">
              <Button variant="outline" onClick={fetchIndexInfo} disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
                인덱스 정보 새로고침
              </Button>
              <Button onClick={optimizeIndexes} disabled={optimizing}>
                {optimizing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Index className="h-4 w-4 mr-2" />}
                인덱스 최적화
              </Button>
            </div>

            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : indexInfo ? (
              <div className="space-y-4">
                {Object.entries(indexInfo).map(([collection, indexes]) => (
                  <div key={collection} className="border rounded-md p-4">
                    <h3 className="text-lg font-medium mb-2">{collection} 컬렉션</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-2 px-4">이름</th>
                            <th className="text-left py-2 px-4">키</th>
                            <th className="text-left py-2 px-4">속성</th>
                          </tr>
                        </thead>
                        <tbody>
                          {indexes.map((index, i) => (
                            <tr key={i} className="border-b">
                              <td className="py-2 px-4">{index.name}</td>
                              <td className="py-2 px-4">
                                {Object.entries(index.key).map(([field, direction]) => (
                                  <div key={field}>
                                    {field}: {direction as React.ReactNode}
                                  </div>
                                ))}
                              </td>
                              <td className="py-2 px-4">
                                {index.unique && (
                                  <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs mr-1">
                                    Unique
                                  </span>
                                )}
                                {index.sparse && (
                                  <span className="inline-block bg-green-100 text-green-800 px-2 py-1 rounded text-xs mr-1">
                                    Sparse
                                  </span>
                                )}
                                {index.background && (
                                  <span className="inline-block bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs mr-1">
                                    Background
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center py-4">인덱스 정보를 불러올 수 없습니다.</p>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      {/* 연결 관리 탭 */}
      <TabsContent value="connection" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>MongoDB 연결 관리</CardTitle>
            <CardDescription>데이터베이스 연결 풀과 성능을 관리합니다.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border rounded-md p-4">
                  <h3 className="text-lg font-medium mb-2">연결 상태</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>상태:</span>
                      <span className="inline-block bg-green-100 text-green-800 px-2 py-1 rounded text-xs">연결됨</span>
                    </div>
                    <div className="flex justify-between">
                      <span>최대 연결 수:</span>
                      <span>100</span>
                    </div>
                    <div className="flex justify-between">
                      <span>활성 연결 수:</span>
                      <span>5</span>
                    </div>
                    <div className="flex justify-between">
                      <span>대기 연결 수:</span>
                      <span>0</span>
                    </div>
                  </div>
                </div>

                <div className="border rounded-md p-4">
                  <h3 className="text-lg font-medium mb-2">연결 풀 설정</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>최대 풀 크기:</span>
                      <span>100</span>
                    </div>
                    <div className="flex justify-between">
                      <span>최소 풀 크기:</span>
                      <span>5</span>
                    </div>
                    <div className="flex justify-between">
                      <span>최대 유휴 시간:</span>
                      <span>30000ms</span>
                    </div>
                    <div className="flex justify-between">
                      <span>연결 제한 시간:</span>
                      <span>10000ms</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full">연결 풀 최적화</Button>
          </CardFooter>
        </Card>
      </TabsContent>

      {/* 보안 탭 */}
      <TabsContent value="security" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>MongoDB 보안 설정</CardTitle>
            <CardDescription>데이터베이스 보안 설정을 관리합니다.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border rounded-md p-4">
                  <h3 className="text-lg font-medium mb-2">인증 설정</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>인증 방식:</span>
                      <span>SCRAM-SHA-256</span>
                    </div>
                    <div className="flex justify-between">
                      <span>SSL/TLS:</span>
                      <span className="inline-block bg-green-100 text-green-800 px-2 py-1 rounded text-xs">활성화</span>
                    </div>
                    <div className="flex justify-between">
                      <span>IP 접근 제한:</span>
                      <span className="inline-block bg-green-100 text-green-800 px-2 py-1 rounded text-xs">활성화</span>
                    </div>
                  </div>
                </div>

                <div className="border rounded-md p-4">
                  <h3 className="text-lg font-medium mb-2">권한 설정</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>역할 기반 접근 제어:</span>
                      <span className="inline-block bg-green-100 text-green-800 px-2 py-1 rounded text-xs">활성화</span>
                    </div>
                    <div className="flex justify-between">
                      <span>필드 수준 암호화:</span>
                      <span className="inline-block bg-red-100 text-red-800 px-2 py-1 rounded text-xs">비활성화</span>
                    </div>
                    <div className="flex justify-between">
                      <span>감사 로깅:</span>
                      <span className="inline-block bg-green-100 text-green-800 px-2 py-1 rounded text-xs">활성화</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full">보안 설정 업데이트</Button>
          </CardFooter>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
