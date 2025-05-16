import clientPromise from "./mongodb"

// 데이터베이스 성능 통계 가져오기
export async function getDatabaseStats() {
  try {
    const client = await clientPromise
    const db = client.db()

    // 데이터베이스 통계 가져오기
    const dbStats = await db.stats()

    // 컬렉션별 통계 가져오기
    const collections = ["posts", "comments", "users", "categories", "tags", "pageviews", "referrers", "devicestats"]
    const collectionStats = {}

    for (const collection of collections) {
      const stats = await db.collection(collection).stats()
      collectionStats[collection] = {
        count: stats.count,
        size: stats.size,
        avgObjSize: stats.avgObjSize,
        storageSize: stats.storageSize,
        totalIndexSize: stats.totalIndexSize,
        indexSizes: stats.indexSizes,
      }
    }

    return {
      dbStats: {
        dataSize: dbStats.dataSize,
        storageSize: dbStats.storageSize,
        indexes: dbStats.indexes,
        totalIndexSize: dbStats.totalIndexSize,
        avgObjSize: dbStats.avgObjSize,
      },
      collectionStats,
    }
  } catch (error) {
    console.error("데이터베이스 통계 가져오기 오류:", error)
    return null
  }
}

// 쿼리 성능 분석
export async function analyzeQueryPerformance(
  collection: string,
  query: object,
  projection: object = {},
  sort: object = {},
) {
  try {
    const client = await clientPromise
    const db = client.db()

    // 쿼리 설명 가져오기
    const explainResult = await db
      .collection(collection)
      .find(query, { projection })
      .sort(sort)
      .explain("executionStats")

    // 성능 지표 추출
    const performanceMetrics = {
      executionTimeMillis: explainResult.executionStats.executionTimeMillis,
      totalDocsExamined: explainResult.executionStats.totalDocsExamined,
      totalKeysExamined: explainResult.executionStats.totalKeysExamined,
      nReturned: explainResult.executionStats.nReturned,
      indexesUsed: explainResult.queryPlanner.winningPlan.inputStage?.indexName || "COLLSCAN",
      isIndexUsed: explainResult.queryPlanner.winningPlan.inputStage?.indexName ? true : false,
    }

    return performanceMetrics
  } catch (error) {
    console.error("쿼리 성능 분석 오류:", error)
    return null
  }
}

// 캐싱 성능 최적화
export function createCacheKey(params: Record<string, any>): string {
  // 파라미터를 정렬하여 일관된 캐시 키 생성
  const sortedParams = Object.keys(params)
    .sort()
    .reduce(
      (acc, key) => {
        acc[key] = params[key]
        return acc
      },
      {} as Record<string, any>,
    )

  return JSON.stringify(sortedParams)
}

// 메모리 사용량 모니터링
export function getMemoryUsage() {
  if (typeof process !== "undefined") {
    const memoryUsage = process.memoryUsage()

    return {
      rss: Math.round(memoryUsage.rss / 1024 / 1024), // RSS (Resident Set Size) in MB
      heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024), // Total heap size in MB
      heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024), // Used heap size in MB
      external: Math.round(memoryUsage.external / 1024 / 1024), // External memory in MB
    }
  }

  return null
}
