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
    const tagSlug = decodeURIComponent(params.slug)

    // 1. slug로 name 찾기
    const tagDoc = await db.collection("tags").findOne({ slug: tagSlug })
    if (!tagDoc) {
      return NextResponse.json([])
    }
    const tagName = tagDoc.name

    // 2. posts.tags(string[])에 name이 포함된 포스트 찾기
    const posts = await db.collection<Post>("posts")
      .find({
        published: true,
        tags: tagName
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