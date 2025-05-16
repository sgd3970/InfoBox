import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

export async function GET(request: Request, { params }: { params: { slug: string } }) {
  try {
    const slug = params.slug

    const client = await clientPromise
    const db = client.db()

    // 포스트 가져오기
    const post = await db.collection("posts").findOne({ slug })

    if (!post) {
      return NextResponse.json({ error: "포스트를 찾을 수 없습니다." }, { status: 404 })
    }

    // 조회수 증가
    await db.collection("posts").updateOne({ slug }, { $inc: { views: 1 } })

    return NextResponse.json(post)
  } catch (error) {
    console.error("포스트 상세 가져오기 오류:", error)
    return NextResponse.json({ error: "포스트를 가져오는 중 오류가 발생했습니다." }, { status: 500 })
  }
}
