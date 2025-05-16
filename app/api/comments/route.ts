import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const postSlug = searchParams.get("postSlug")

    if (!postSlug) {
      return NextResponse.json({ error: "포스트 슬러그가 필요합니다." }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db()

    // 댓글 가져오기
    const comments = await db.collection("comments").find({ postSlug }).sort({ createdAt: -1 }).toArray()

    return NextResponse.json(comments)
  } catch (error) {
    console.error("댓글 가져오기 오류:", error)
    return NextResponse.json({ error: "댓글을 가져오는 중 오류가 발생했습니다." }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { postSlug, content } = await request.json()

    if (!postSlug || !content) {
      return NextResponse.json({ error: "포스트 슬러그와 내용이 필요합니다." }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db()

    // 포스트 확인
    const post = await db.collection("posts").findOne({ slug: postSlug })
    if (!post) {
      return NextResponse.json({ error: "존재하지 않는 포스트입니다." }, { status: 404 })
    }

    // 댓글 작성 (실제 앱에서는 인증된 사용자 정보 사용)
    const comment = {
      postId: post._id.toString(),
      postSlug,
      author: "사용자", // 실제 앱에서는 인증된 사용자 이름
      authorId: "user-id", // 실제 앱에서는 인증된 사용자 ID
      content,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await db.collection("comments").insertOne(comment)

    return NextResponse.json({
      _id: result.insertedId,
      ...comment,
    })
  } catch (error) {
    console.error("댓글 작성 오류:", error)
    return NextResponse.json({ error: "댓글을 작성하는 중 오류가 발생했습니다." }, { status: 500 })
  }
}
