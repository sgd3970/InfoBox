import { NextResponse } from "next/server"
import { getMongoClient } from "@/lib/mongodb"
import type { Post } from "@/lib/models"

export const dynamic = "force-dynamic"

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const tagSlug = params.slug
    const client = await getMongoClient()
    const db = client.db()
    
    const posts = await db
      .collection<Post>("posts")
      .find({
        tags: { $regex: new RegExp(`^${tagSlug}$`, 'i') }
      })
      .sort({ publishedAt: -1 })
      .toArray()

    // _id를 문자열로 변환하여 직렬화 가능하게 함
    const serializablePosts = posts.map(post => ({
        ...post,
        _id: post._id.toString(),
    }))

    return NextResponse.json(serializablePosts)
  } catch (error) {
    console.error("태그별 포스트 API 오류:", error)
    return NextResponse.json([], { status: 200 })
  }
} 