import { NextResponse } from "next/server"
import { getMemoryUsage, analyzeQueryPerformance } from "@/lib/performance"
import clientPromise from "@/lib/mongodb"

export const dynamic = "force-dynamic"

interface CollectionStats {
  documentCount: number
  size: number
}

interface DatabaseStats {
  collections: Record<string, CollectionStats>
  totalDocuments: number
  totalSize: number
}

async function getDatabaseStats(): Promise<DatabaseStats | null> {
  try {
    const client = await clientPromise
    const db = client.db()
    
    // 컬렉션 목록 가져오기
    const collections = await db.listCollections().toArray()
    const stats: DatabaseStats = {
      collections: {},
      totalDocuments: 0,
      totalSize: 0,
    }

    // 각 컬렉션의 통계 수집
    for (const collection of collections) {
      const name = collection.name
      const count = await db.collection(name).countDocuments()
      
      // 샘플 문서로 크기 추정
      const sampleDoc = await db.collection(name).findOne()
      const avgDocSize = sampleDoc ? JSON.stringify(sampleDoc).length : 0
      const estimatedSize = count * avgDocSize
      
      stats.collections[name] = {
        documentCount: count,
        size: estimatedSize,
      }
      
      stats.totalDocuments += count
      stats.totalSize += estimatedSize
    }

    return stats
  } catch (error) {
    console.error("데이터베이스 통계 가져오기 오류:", error)
    return null
  }
}

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
