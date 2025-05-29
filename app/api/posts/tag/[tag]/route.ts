import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET(
  request: Request,
  { params }: { params: { tag: string } }
) {
  try {
    const client = await clientPromise
    const db = client.db(process.env.MONGODB_DB)
    const tag = decodeURIComponent(params.tag)

    // 태그로 게시물 검색
    const posts = await db
      .collection("posts")
      .find({ 
        tags: tag,
        published: true 
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
    console.error("태그별 게시물 가져오기 오류:", error)
    return NextResponse.json(
      { error: "태그별 게시물을 가져오는데 실패했습니다." },
      { status: 500 }
    )
  }
} 