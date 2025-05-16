import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const tag = searchParams.get("tag")
    const featured = searchParams.get("featured")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const skip = (page - 1) * limit

    const client = await clientPromise
    const db = client.db()

    // 필터 조건 구성
    const filter: any = {}
    if (category) filter.category = category
    if (tag) filter.tags = tag
    if (featured === "true") filter.featured = true

    // 포스트 가져오기
    const posts = await db.collection("posts").find(filter).sort({ date: -1 }).skip(skip).limit(limit).toArray()

    // 총 포스트 수 가져오기
    const total = await db.collection("posts").countDocuments(filter)

    return NextResponse.json({
      posts,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("포스트 가져오기 오류:", error)
    return NextResponse.json({ error: "포스트를 가져오는 중 오류가 발생했습니다." }, { status: 500 })
  }
}
