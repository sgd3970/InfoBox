import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import type { Post } from "@/lib/models"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db()
    const posts = await db
      .collection<Post>("posts")
      .find({})
      .sort({ publishedAt: -1 })
      .limit(6)
      .toArray()
      
    // _id를 문자열로 변환하여 직렬화 가능하게 함
    const serializablePosts = posts.map(post => ({
        ...post,
        _id: post._id.toString(),
    }))

    return NextResponse.json(serializablePosts)
  } catch (error) {
    console.error("최신 포스트 API 오류:", error)
    // 오류 발생 시에도 빈 배열로 응답하여 페이지가 깨지지 않도록 함
    return NextResponse.json([], { status: 200 })
  }
} 