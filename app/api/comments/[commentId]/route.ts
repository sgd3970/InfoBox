import { NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export const dynamic = "force-dynamic"

export async function PUT(
  request: Request,
  { params }: { params: { commentId: string } }
) {
  const session = await getServerSession(authOptions)

  if (!session || session.user?.role !== "admin") {
    return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 })
  }

  try {
    const commentId = params.commentId
    const { text } = await request.json()
    const db = await getDatabase()

    const result = await db.collection("comments").updateOne(
      { _id: new ObjectId(commentId) },
      { $set: { text, updatedAt: new Date() } }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: "댓글을 찾을 수 없습니다." },
        { status: 404 }
      )
    }

    return NextResponse.json({ message: "댓글이 수정되었습니다." })
  } catch (error) {
    console.error("API /api/comments/[commentId] PUT 오류:", error)
    return NextResponse.json(
      { error: "댓글 수정 중 오류가 발생했습니다." },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { commentId: string } }
) {
  const session = await getServerSession(authOptions)

  if (!session || session.user?.role !== "admin") {
    return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 })
  }

  try {
    const commentId = params.commentId
    const db = await getDatabase()

    const result = await db.collection("comments").deleteOne({ _id: new ObjectId(commentId) })

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: "댓글을 찾을 수 없습니다." },
        { status: 404 }
      )
    }

    return NextResponse.json({ message: "댓글이 삭제되었습니다." })
  } catch (error) {
    console.error("API /api/comments/[commentId] DELETE 오류:", error)
    return NextResponse.json(
      { error: "댓글 삭제 중 오류가 발생했습니다." },
      { status: 500 }
    )
  }
} 