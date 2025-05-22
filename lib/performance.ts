import { getDatabase } from "./mongodb"
import { getCachedData, createCacheKey } from "./cache"

// 데이터베이스 성능 통계 가져오기 (캐시 적용)
export async function getDatabaseStats() {
  const cacheKey = createCacheKey('db:stats', {})
  
  return getCachedData(cacheKey, async () => {
    try {
      const db = await getDatabase()

      // 데이터베이스 통계 가져오기
      const dbStats = await db.stats()

      // 필요한 컬렉션만 선택적으로 통계 수집
      const essentialCollections = ["posts", "comments", "users"]
      const collectionStats: { [key: string]: any } = {}

      for (const collectionName of essentialCollections) {
        try {
          const stats = await db.command({ collStats: collectionName })
          collectionStats[collectionName] = {
            count: stats.count,
            size: stats.size,
            avgObjSize: stats.avgObjSize,
            totalIndexSize: stats.totalIndexSize,
          }
        } catch (error) {
          console.error(`${collectionName} 통계 수집 실패:`, error)
          // 개별 컬렉션 실패는 전체 프로세스를 중단하지 않음
          continue
        }
      }

      return {
        dbStats: {
          dataSize: dbStats.dataSize,
          storageSize: dbStats.storageSize,
          indexes: dbStats.indexes,
          totalIndexSize: dbStats.totalIndexSize,
        },
        collectionStats,
      }
    } catch (error) {
      console.error("데이터베이스 통계 가져오기 오류:", error)
      return null
    }
  }, 300) // 5분 캐시
}

// 쿼리 성능 분석 (캐시 적용)
export async function analyzeQueryPerformance(
  collection: string,
  query: object,
  projection: object = {},
  sort: any = {},
) {
  const cacheKey = createCacheKey('query:performance', {
    collection,
    query: JSON.stringify(query),
    projection: JSON.stringify(projection),
    sort: JSON.stringify(sort),
  })

  return getCachedData(cacheKey, async () => {
    try {
      const db = await getDatabase()

      // 쿼리 설명 가져오기 (실행 계획만)
      const explainResult = await db
        .collection(collection)
        .find(query, { projection })
        .sort(sort)
        .explain("queryPlanner") // executionStats 대신 queryPlanner 사용

      // 필수 성능 지표만 추출
      const performanceMetrics = {
        indexesUsed: explainResult.queryPlanner.winningPlan.inputStage?.indexName || "COLLSCAN",
        isIndexUsed: explainResult.queryPlanner.winningPlan.inputStage?.indexName ? true : false,
      }

      return performanceMetrics
    } catch (error) {
      console.error("쿼리 성능 분석 오류:", error)
      return null
    }
  }, 3600) // 1시간 캐시
}

// 메모리 사용량 모니터링 (서버리스 환경에 맞게 간소화)
export function getMemoryUsage() {
  if (typeof process === "undefined") return null

  try {
    const memoryUsage = process.memoryUsage()
    return {
      heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024), // MB 단위
      heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024), // MB 단위
    }
  } catch (error) {
    console.error("메모리 사용량 확인 오류:", error)
    return null
  }
}
