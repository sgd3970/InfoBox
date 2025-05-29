import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const { db } = await connectToDatabase()
    const slug = decodeURIComponent(params.slug)

    // 태그 slug로 게시물 검색
    const posts = await db.collection("posts")
      .find({
        published: true,
        "tags.slug": slug
      })
      .sort({ date: -1 })
      .toArray()

    // ObjectId를 문자열로 변환
    const formattedPosts = posts.map(post => ({
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