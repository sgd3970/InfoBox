import { NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import type { Comment } from "@/lib/models"
import bcrypt from "bcryptjs"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const postId = searchParams.get("postId")

    if (!postId) {
      return NextResponse.json(
        { error: "postId가 필요합니다." },
        { status: 400 }
      )
    }

    const db = await getDatabase()
    const comments = await db
      .collection<Comment>("comments")
      .find({ postId: postId })
      .sort({ createdAt: 1 })
      .toArray()

    const serializableComments = comments.map(comment => ({
      ...comment,
      _id: comment._id.toString(),
      postId: comment.postId.toString(),
    }))

    return NextResponse.json(serializableComments)
  } catch (error) {
    console.error("API /api/comments GET 오류:", error)
    return NextResponse.json(
      { error: "댓글을 가져오는 중 오류가 발생했습니다." },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const { postId, nickname, password, text, isPrivate } = await request.json()

    if (!postId || !nickname || !text) {
      return NextResponse.json(
        { error: "postId, 닉네임, 내용은 필수입니다." },
        { status: 400 }
      )
    }

    const db = await getDatabase()

    // 비밀번호 해싱 (선택 사항)
    const hashedPassword = password ? await bcrypt.hash(password, 10) : undefined

    const newComment = {
      postId: new ObjectId(postId),
      nickname,
      password: hashedPassword,
      text,
      isPrivate: isPrivate || false,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await db.collection("comments").insertOne(newComment)
    const insertedComment = {
      _id: result.insertedId,
      ...newComment,
      postId: newComment.postId.toString(),
    }

    // 포스트 댓글 수 업데이트
    await db.collection("posts").updateOne(
      { _id: new ObjectId(postId) },
      { $inc: { commentCount: 1 } }
    )

    return NextResponse.json(insertedComment, { status: 201 })
  } catch (error) {
    console.error("API /api/comments POST 오류:", error)
    return NextResponse.json(
      { error: "댓글 생성 중 오류가 발생했습니다." },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
) {
  const session = await getServerSession(authOptions)

  if (!session || session.user?.role !== "admin") {
    return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json(
        { error: "댓글 ID가 필요합니다." },
        { status: 400 }
      )
    }

    const db = await getDatabase()

    const result = await db.collection("comments").deleteOne({
      _id: new ObjectId(id),
    })

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: "댓글을 찾을 수 없습니다." },
        { status: 404 }
      )
    }

    return NextResponse.json({ message: "댓글이 삭제되었습니다." })
  } catch (error) {
    console.error("댓글 삭제 오류:", error)
    return NextResponse.json(
      { error: "댓글을 삭제하는 중 오류가 발생했습니다." },
      { status: 500 }
    )
  }
}
