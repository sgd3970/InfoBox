import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db()

    // 태그 가져오기
    const tags = await db.collection("tags").find().sort({ postCount: -1 }).toArray()

    return NextResponse.json(tags)
  } catch (error) {
    console.error("태그 가져오기 오류:", error)
    return NextResponse.json({ error: "태그를 가져오는 중 오류가 발생했습니다." }, { status: 500 })
  }
}
