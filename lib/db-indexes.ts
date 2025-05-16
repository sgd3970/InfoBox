import clientPromise from "./mongodb"

export async function optimizeIndexes() {
  try {
    const client = await clientPromise
    const db = client.db()

    console.log("데이터베이스 인덱스 최적화 시작...")

    // 포스트 컬렉션 인덱스 최적화
    await db.collection("posts").createIndex(
      { title: "text", description: "text", content: "text" },
      {
        name: "posts_text_search",
        weights: {
          title: 10,
          description: 5,
          content: 1,
        },
        default_language: "none",
      },
    )

    // 복합 인덱스 추가
    await db.collection("posts").createIndex({ category: 1, date: -1 }, { name: "category_date" })
    await db.collection("posts").createIndex({ tags: 1, date: -1 }, { name: "tags_date" })
    await db.collection("posts").createIndex({ featured: 1, date: -1 }, { name: "featured_date" })
    await db.collection("posts").createIndex({ views: -1 }, { name: "views_desc" })

    // 댓글 컬렉션 인덱스 최적화
    await db.collection("comments").createIndex({ postId: 1, createdAt: -1 }, { name: "postId_createdAt" })
    await db.collection("comments").createIndex({ authorId: 1 }, { name: "authorId" })

    // 페이지뷰 컬렉션 인덱스 최적화
    await db.collection("pageviews").createIndex({ path: 1, date: -1 }, { name: "path_date" })

    // 리퍼러 컬렉션 인덱스 최적화
    await db.collection("referrers").createIndex({ source: 1, date: -1 }, { name: "source_date" })

    // 디바이스 통계 컬렉션 인덱스 최적화
    await db.collection("devicestats").createIndex({ device: 1, date: -1 }, { name: "device_date" })

    console.log("데이터베이스 인덱스 최적화 완료")
    return true
  } catch (error) {
    console.error("데이터베이스 인덱스 최적화 오류:", error)
    return false
  }
}

export async function getIndexInfo() {
  try {
    const client = await clientPromise
    const db = client.db()

    // 각 컬렉션의 인덱스 정보 가져오기
    const collections = ["posts", "comments", "users", "categories", "tags", "pageviews", "referrers", "devicestats"]

    const indexInfo: Record<string, any[]> = {}

    for (const collection of collections) {
      const indexes = await db.collection(collection).indexes()
      indexInfo[collection] = indexes
    }

    return indexInfo
  } catch (error) {
    console.error("인덱스 정보 가져오기 오류:", error)
    return null
  }
}
