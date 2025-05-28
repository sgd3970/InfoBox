import { NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { ObjectId } from "mongodb"

export const dynamic = "force-dynamic"

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)

  if (!session || session.user?.role !== "admin") {
    console.log("API /api/categories/[id] DELETE - Authentication failed or not admin")
    return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 })
  }

  try {
    const db = await getDatabase()
    const categoryId = params.id

    // Check if category exists
    const category = await db.collection("categories").findOne({
      _id: new ObjectId(categoryId)
    })

    if (!category) {
      return NextResponse.json(
        { error: "카테고리를 찾을 수 없습니다." },
        { status: 404 }
      )
    }

    // Check if there are any posts in this category
    const postCount = await db.collection("posts").countDocuments({
      category: category.name
    })

    if (postCount > 0) {
      return NextResponse.json(
        { error: "이 카테고리에 게시물이 있어 삭제할 수 없습니다." },
        { status: 400 }
      )
    }

    // Delete the category
    await db.collection("categories").deleteOne({
      _id: new ObjectId(categoryId)
    })

    return NextResponse.json({ message: "카테고리가 삭제되었습니다." })
  } catch (error) {
    console.error("API /api/categories/[id] DELETE 오류:", error)
    return NextResponse.json(
      { error: "카테고리 삭제 중 오류가 발생했습니다." },
      { status: 500 }
    )
  }
} 