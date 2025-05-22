import clientPromise from "./mongodb"
import { processInBatches, withRetry } from "./cache"
import { IndexSpecification, IndexDescription } from "mongodb"

// 인덱스 정의
const indexDefinitions: Record<string, IndexDescription[]> = {
  posts: [
    {
      key: { title: "text", description: "text", content: "text" },
      name: "posts_text_search",
      weights: { title: 10, description: 5, content: 1 },
      default_language: "none",
    },
    { key: { category: 1, date: -1 }, name: "category_date" },
    { key: { tags: 1, date: -1 }, name: "tags_date" },
    { key: { featured: 1, date: -1 }, name: "featured_date" },
    { key: { views: -1 }, name: "views_desc" },
  ],
  comments: [
    { key: { postId: 1, createdAt: -1 }, name: "postId_createdAt" },
    { key: { authorId: 1 }, name: "authorId" },
  ],
  pageviews: [
    { key: { path: 1, date: -1 }, name: "path_date" },
  ],
  referrers: [
    { key: { source: 1, date: -1 }, name: "source_date" },
  ],
  devicestats: [
    { key: { device: 1, date: -1 }, name: "device_date" },
  ],
}

// 인덱스 최적화 (배치 처리 적용)
export async function optimizeIndexes(onProgress?: (progress: number) => void) {
  try {
    const client = await clientPromise
    const db = client.db()

    console.log("데이터베이스 인덱스 최적화 시작...")

    // 컬렉션별로 배치 처리
    const collections = Object.keys(indexDefinitions)
    await processInBatches(
      collections,
      1, // 한 번에 하나의 컬렉션만 처리
      async (collectionBatch) => {
        for (const collectionName of collectionBatch) {
          const indexes = indexDefinitions[collectionName]
          if (!indexes) continue

          // 각 인덱스 생성 시도
          for (const index of indexes) {
            await withRetry(
              async () => {
                await db.collection(collectionName).createIndex(index.key, index)
              },
              3, // 최대 3번 재시도
              1000 // 1초 간격
            )
          }
        }
      },
      onProgress
    )

    console.log("데이터베이스 인덱스 최적화 완료")
    return true
  } catch (error) {
    console.error("데이터베이스 인덱스 최적화 오류:", error)
    return false
  }
}

// 인덱스 정보 가져오기 (필수 정보만)
export async function getIndexInfo() {
  try {
    const client = await clientPromise
    const db = client.db()

    const indexInfo: Record<string, any[]> = {}
    const collections = Object.keys(indexDefinitions)

    // 필요한 컬렉션만 선택적으로 처리
    for (const collection of collections) {
      try {
        const indexes = await db.collection(collection).indexes()
        // 필수 정보만 추출
        indexInfo[collection] = indexes.map(index => ({
          name: index.name,
          key: index.key,
          background: index.background,
          unique: index.unique,
        }))
      } catch (error) {
        console.error(`${collection} 인덱스 정보 가져오기 실패:`, error)
        continue
      }
    }

    return indexInfo
  } catch (error) {
    console.error("인덱스 정보 가져오기 오류:", error)
    return null
  }
}
