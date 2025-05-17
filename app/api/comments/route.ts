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

    // 댓글 가져오기 (비밀번호 제외)
    const comments = await db
      .collection("comments")
      .find(
        { postSlug },
        { projection: { password: 0 } } // 비밀번호 필드 제외
      )
      .sort({ createdAt: -1 })
      .toArray()

    return NextResponse.json(comments)
  } catch (error) {
    console.error("댓글 가져오기 오류:", error)
    return NextResponse.json({ error: "댓글을 가져오는 중 오류가 발생했습니다." }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { postSlug, nickname, password, content, isPrivate } = await request.json()

    if (!postSlug || !nickname || !content) {
      return NextResponse.json(
        { error: "포스트 슬러그, 닉네임, 내용은 필수입니다." },
        { status: 400 }
      )
    }

    if (isPrivate && !password) {
      return NextResponse.json(
        { error: "비밀글인 경우 비밀번호를 입력해야 합니다." },
        { status: 400 }
      )
    }

    const client = await clientPromise
    const db = client.db()

    // 포스트 확인
    const post = await db.collection("posts").findOne({ slug: postSlug })
    if (!post) {
      return NextResponse.json({ error: "존재하지 않는 포스트입니다." }, { status: 404 })
    }

    // 댓글 작성
    const comment = {
      postId: post._id.toString(),
      postSlug,
      nickname,
      password: isPrivate ? password : "", // 비밀글이 아닌 경우 빈 문자열
      content,
      isPrivate: isPrivate || false,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await db.collection("comments").insertOne(comment)

    // 응답에서는 비밀번호 제외
    const { password: _, ...commentWithoutPassword } = comment

    return NextResponse.json({
      _id: result.insertedId,
      ...commentWithoutPassword,
    })
  } catch (error) {
    console.error("댓글 작성 오류:", error)
    return NextResponse.json({ error: "댓글을 작성하는 중 오류가 발생했습니다." }, { status: 500 })
  }
}
