import { NextResponse } from "next/server"
import { getDatabaseStats, getMemoryUsage, analyzeQueryPerformance } from "@/lib/performance"

export async function GET() {
  try {
    // 데이터베이스 통계 가져오기
    const dbStats = await getDatabaseStats()

    // 메모리 사용량 가져오기
    const memoryUsage = getMemoryUsage()

    // 일반적인 쿼리 성능 분석
    const postsQueryPerformance = await analyzeQueryPerformance("posts", {}, {}, { date: -1 })
    const featuredPostsQueryPerformance = await analyzeQueryPerformance("posts", { featured: true }, {}, { date: -1 })
    const categoryPostsQueryPerformance = await analyzeQueryPerformance(
      "posts",
      { category: "Development" },
      {},
      { date: -1 },
    )

    return NextResponse.json({
      dbStats,
      memoryUsage,
      queryPerformance: {
        posts: postsQueryPerformance,
        featuredPosts: featuredPostsQueryPerformance,
        categoryPosts: categoryPostsQueryPerformance,
      },
    })
  } catch (error) {
    console.error("성능 데이터 API 오류:", error)
    return NextResponse.json({ error: "성능 데이터를 가져오는 중 오류가 발생했습니다." }, { status: 500 })
  }
}
