import { NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const db = await getDatabase()

    // 태그 가져오기
    const tags = await db.collection("tags").find().sort({ postCount: -1 }).toArray()

    return NextResponse.json(tags)
  } catch (error) {
    console.error("태그 가져오기 오류:", error)
    return NextResponse.json({ error: "태그를 가져오는 중 오류가 발생했습니다." }, { status: 500 })
  }
}
