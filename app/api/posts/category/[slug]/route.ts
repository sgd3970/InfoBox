import { NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import type { Post } from "@/lib/models"

export const dynamic = "force-dynamic"

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const categorySlug = params.slug
    const db = await getDatabase()
    
    const posts = await db
      .collection<Post>("posts")
      .find({
        category: { $regex: new RegExp(`^${categorySlug}$`, 'i') }
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
    console.error("카테고리별 포스트 API 오류:", error)
    return NextResponse.json([], { status: 200 })
  }
} 