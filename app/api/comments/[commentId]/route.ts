import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export const dynamic = "force-dynamic"

export async function DELETE(
  request: Request,
  { params }: { params: { commentId: string } }
) {
  try {
    const { commentId } = params
    const { password } = await request.json()

    if (!commentId || !password) {
      return NextResponse.json(
        { error: "댓글 ID와 비밀번호가 필요합니다." },
        { status: 400 }
      )
    }

    const client = await clientPromise
    const db = client.db()

    // 댓글 삭제 (ID와 비밀번호 일치 시)
    const result = await db.collection("comments").deleteOne({
      _id: new ObjectId(commentId),
      password: password
    })

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: "댓글을 찾을 수 없거나 비밀번호가 일치하지 않습니다." },
        { status: 404 }
      )
    }

    return NextResponse.json({ message: "댓글이 성공적으로 삭제되었습니다." })
  } catch (error) {
    console.error("댓글 삭제 오류:", error)
    return NextResponse.json(
      { error: "댓글 삭제 중 오류가 발생했습니다." },
      { status: 500 }
    )
  }
} 