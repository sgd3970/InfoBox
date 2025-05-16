import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db()

    // 카테고리 가져오기
    const categories = await db.collection("categories").find().sort({ name: 1 }).toArray()

    return NextResponse.json(categories)
  } catch (error) {
    console.error("카테고리 가져오기 오류:", error)
    return NextResponse.json({ error: "카테고리를 가져오는 중 오류가 발생했습니다." }, { status: 500 })
  }
}
