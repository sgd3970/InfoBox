"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

export default function InitDbClient() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success?: boolean; message?: string; error?: string } | null>(null)

  const initDatabase = async () => {
    try {
      setLoading(true)
      setResult(null)

      const res = await fetch("/api/init-db")
      const data = await res.json()

      setResult(data)
    } catch (error) {
      console.error("데이터베이스 초기화 오류:", error)
      setResult({ error: "데이터베이스 초기화 중 오류가 발생했습니다." })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container py-10">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>데이터베이스 초기화</CardTitle>
            <CardDescription>MongoDB 데이터베이스를 초기화하고 테스트 데이터를 삽입합니다.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              이 작업은 데이터베이스 컬렉션을 생성하고 테스트 데이터를 삽입합니다. 기존 데이터가 있는 경우 덮어쓰지
              않습니다.
            </p>

            {result && (
              <div
                className={`p-4 rounded-md mb-4 ${
                  result.success ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                }`}
              >
                {result.message || result.error}
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button onClick={initDatabase} disabled={loading} className="w-full">
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {loading ? "초기화 중..." : "데이터베이스 초기화"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
