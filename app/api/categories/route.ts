import { NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import type { Category } from "@/lib/models"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const db = await getDatabase()
    const categories = await db.collection<Category>("categories").find({}).toArray()

    // 각 카테고리별로 postCount 계산
    const categoriesWithCount = await Promise.all(
      categories.map(async (category) => {
        const count = await db.collection("posts").countDocuments({ category: category.name })
        return { ...category, postCount: count }
      })
    )

    return NextResponse.json(categoriesWithCount)
  } catch (error) {
    console.error("카테고리 API 오류:", error)
    return NextResponse.json([], { status: 200 })
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session || session.user?.role !== "admin") {
    console.log("API /api/categories POST - Authentication failed or not admin")
    return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 })
  }

  try {
    const categoryData = await request.json()
    const db = await getDatabase()

    // 필수 필드 검증
    if (!categoryData.name || !categoryData.slug) {
      return NextResponse.json(
        { error: "카테고리 이름과 슬러그는 필수입니다." },
        { status: 400 }
      )
    }

    // 슬러그 중복 검사
    const existingCategory = await db.collection("categories").findOne({
      slug: categoryData.slug,
    })
    if (existingCategory) {
      return NextResponse.json(
        { error: `슬러그 '${categoryData.slug}'는 이미 존재합니다.` },
        { status: 400 }
      )
    }

    // 카테고리 데이터 준비
    const newCategory = {
      name: categoryData.name,
      slug: categoryData.slug,
      description: categoryData.description || "",
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    // 데이터베이스에 카테고리 삽입
    const result = await db.collection("categories").insertOne(newCategory)
    const insertedCategory = {
      _id: result.insertedId,
      ...newCategory,
      postCount: 0, // 새로 추가된 카테고리는 포스트가 없으므로 0
    }

    console.log("API /api/categories POST - Category created successfully")
    return NextResponse.json(insertedCategory, { status: 201 })
  } catch (error) {
    console.error("API /api/categories POST 오류:", error)
    return NextResponse.json(
      { error: "카테고리 생성 중 오류가 발생했습니다." },
      { status: 500 }
    )
  }
}
