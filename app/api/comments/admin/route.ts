import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export const dynamic = "force-dynamic"

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session || session.user?.role !== "admin") {
    return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 })
  }

  try {
    const db = await getDatabase()
    const comments = await db.collection("comments").find({}).toArray()
    
    const serializableComments = comments.map(comment => ({
      ...comment,
      _id: comment._id.toString(),
      postId: comment.postId.toString(),
    }))

    return NextResponse.json(serializableComments)
  } catch (error) {
    console.error("API /api/comments/admin GET 오류:", error)
    return NextResponse.json(
      { error: "댓글 목록을 가져오는 중 오류가 발생했습니다." },
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
    const { commentId } = await request.json()
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
    console.error("API /api/comments/admin DELETE 오류:", error)
    return NextResponse.json(
      { error: "댓글 삭제 중 오류가 발생했습니다." },
      { status: 500 }
    )
  }
} 