import { type NextRequest, NextResponse } from "next/server"
import { advancedSearch, type SearchOptions } from "@/lib/search"
import clientPromise from "@/lib/mongodb"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams

    // 검색 옵션 구성
    const options: SearchOptions = {
      query: searchParams.get("q") || "",
      category: searchParams.get("category") || undefined,
      tags: searchParams.get("tags")?.split(",") || undefined,
      dateFrom: searchParams.get("dateFrom") || undefined,
      dateTo: searchParams.get("dateTo") || undefined,
      sortBy: (searchParams.get("sortBy") as SearchOptions["sortBy"]) || "relevance",
      sortOrder: (searchParams.get("sortOrder") as SearchOptions["sortOrder"]) || "desc",
      page: Number.parseInt(searchParams.get("page") || "1", 10),
      limit: Number.parseInt(searchParams.get("limit") || "10", 10),
    }

    // 고급 검색 실행
    const results = await advancedSearch(options)

    return NextResponse.json(results)
  } catch (error) {
    console.error("검색 API 오류:", error)
    return NextResponse.json({ error: "검색 중 오류가 발생했습니다." }, { status: 500 })
  }
}
