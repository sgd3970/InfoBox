import { NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { ObjectId, WithId, Document } from "mongodb"
import type { Post } from "@/lib/models"

export const dynamic = "force-dynamic"

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const db = await getDatabase()
    const tag = decodeURIComponent(params.slug)

    // 태그로 게시물 검색
    const posts = await db.collection<Post>("posts")
      .find({
        published: true,
        tags: tag // 단순 문자열 배열에서 태그 검색
      })
      .sort({ date: -1 })
      .toArray()

    // ObjectId를 문자열로 변환
    const formattedPosts = posts.map((post: WithId<Post>) => ({
      ...post,
      _id: post._id.toString()
    }))

    return NextResponse.json(formattedPosts)
  } catch (error) {
    console.error("태그별 게시물 조회 중 오류 발생:", error)
    return NextResponse.json(
      { error: "태그별 게시물을 가져오는 중 오류가 발생했습니다." },
      { status: 500 }
    )
  }
} 