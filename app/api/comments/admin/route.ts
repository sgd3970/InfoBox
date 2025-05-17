import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user?.role !== "admin") {
      return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 })
    }

    const client = await clientPromise
    const db = client.db()
    
    // 댓글 목록 가져오기 (최신순)
    const comments = await db
      .collection("comments")
      .aggregate([
        {
          $lookup: {
            from: "posts",
            localField: "postId",
            foreignField: "_id",
            as: "post",
          },
        },
        {
          $unwind: "$post",
        },
        {
          $project: {
            _id: 1,
            nickname: 1,
            content: 1,
            isPrivate: 1,
            createdAt: 1,
            postSlug: "$post.slug",
            postTitle: "$post.title",
          },
        },
        {
          $sort: { createdAt: -1 },
        },
      ])
      .toArray()

    return NextResponse.json(comments)
  } catch (error) {
    console.error("댓글 가져오기 오류:", error)
    return NextResponse.json(
      { error: "댓글을 가져오는 중 오류가 발생했습니다." },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user?.role !== "admin") {
      return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json(
        { error: "댓글 ID가 필요합니다." },
        { status: 400 }
      )
    }

    const client = await clientPromise
    const db = client.db()

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