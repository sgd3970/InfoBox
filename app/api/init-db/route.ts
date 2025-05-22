import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { processInBatches, withRetry } from "@/lib/cache"

// 초기 데이터 정의
const initialData = {
  categories: [
    { slug: "development", name: "개발", description: "개발 관련 포스트" },
    { slug: "design", name: "디자인", description: "디자인 관련 포스트" },
    { slug: "business", name: "비즈니스", description: "비즈니스 관련 포스트" },
  ],
  tags: [
    { name: "JavaScript", slug: "javascript" },
    { name: "TypeScript", slug: "typescript" },
    { name: "React", slug: "react" },
    { name: "Next.js", slug: "nextjs" },
    { name: "Node.js", slug: "nodejs" },
  ],
}

export const dynamic = "force-dynamic"
export const maxDuration = 60 // 5분 타임아웃

export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db()

    // 진행 상황 추적
    const progress: { [key: string]: number } = {}
    const updateProgress = (step: string, value: number) => {
      progress[step] = value
    }

    // 컬렉션 초기화
    const collections = ["categories", "tags", "posts", "comments", "users"]
    await processInBatches(
      collections,
      1,
      async (collectionBatch) => {
        for (const collectionName of collectionBatch) {
          await withRetry(
            async () => {
              // 컬렉션이 비어있는 경우에만 초기 데이터 삽입
              const count = await db.collection(collectionName).countDocuments()
              if (count === 0 && initialData[collectionName as keyof typeof initialData]) {
                const data = initialData[collectionName as keyof typeof initialData]
                if (Array.isArray(data)) {
                  await db.collection(collectionName).insertMany(data)
                }
              }
              updateProgress(collectionName, 100)
            },
            3,
            1000
          )
        }
      },
      (value) => updateProgress("collections", value)
    )

    // 인덱스 생성
    await processInBatches(
      ["categories", "tags", "posts", "comments", "users"],
      1,
      async (collectionBatch) => {
        for (const collectionName of collectionBatch) {
          await withRetry(
            async () => {
              // 기본 인덱스 생성
              await db.collection(collectionName).createIndex({ slug: 1 }, { unique: true })
              if (collectionName === "posts") {
                await db.collection(collectionName).createIndex({ date: -1 })
                await db.collection(collectionName).createIndex({ category: 1 })
                await db.collection(collectionName).createIndex({ tags: 1 })
              }
              if (collectionName === "comments") {
                await db.collection(collectionName).createIndex({ postId: 1, createdAt: -1 })
              }
              updateProgress(`${collectionName}_indexes`, 100)
            },
            3,
            1000
          )
        }
      },
      (value) => updateProgress("indexes", value)
    )

    return NextResponse.json({
      success: true,
      message: "데이터베이스가 성공적으로 초기화되었습니다.",
      progress,
    })
  } catch (error) {
    console.error("데이터베이스 초기화 오류:", error)
    return NextResponse.json(
      { success: false, error: "데이터베이스 초기화 중 오류가 발생했습니다." },
      { status: 500 }
    )
  }
} 