import { type NextRequest, NextResponse } from "next/server"
import { getSearchSuggestions } from "@/lib/search"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get("q") || ""
    const limit = Number.parseInt(searchParams.get("limit") || "5", 10)

    if (!query || query.trim().length < 2) {
      return NextResponse.json({ suggestions: [] })
    }

    const suggestions = await getSearchSuggestions(query, limit)

    return NextResponse.json({ suggestions })
  } catch (error) {
    console.error("검색 제안 API 오류:", error)
    return NextResponse.json({ error: "검색 제안을 가져오는 중 오류가 발생했습니다." }, { status: 500 })
  }
}
