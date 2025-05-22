import { NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session || session.user?.role !== "admin") {
    return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const tag = searchParams.get("tag")
    const featured = searchParams.get("featured") === "true"
    const limit = searchParams.get("limit")
    const skip = searchParams.get("skip")

    const query: any = {}
    if (category) {
      query.category = category
    }
    if (tag) {
      query.tags = { $in: [tag] }
    }
    if (featured) {
      query.featured = true
    }

    const options: any = {
      sort: { date: -1 },
    }

    if (limit) {
      options.limit = parseInt(limit, 10)
    }
    if (skip) {
      options.skip = parseInt(skip, 10)
    }

    const db = await getDatabase()
    const posts = await db.collection("posts").find(query, options).toArray()

    // _id를 문자열로 변환하여 직렬화 가능하게 함
    const serializablePosts = posts.map(post => ({
        ...post,
        _id: post._id.toString(),
    }))

    return NextResponse.json(serializablePosts)
  } catch (error) {
    console.error("API /api/posts GET 오류:", error)
    return NextResponse.json(
      { error: "포스트를 가져오는 중 오류가 발생했습니다." },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  // 이 POST 함수는 /api/posts/[slug]/route.ts로 이동되었거나 사용되지 않음
  return NextResponse.json({ error: "메소드가 허용되지 않습니다." }, { status: 405 })
}

export async function PUT(
  request: Request,
  { params }: { params: { slug: string } }
) {
  // 이 PUT 함수는 /api/posts/[slug]/route.ts로 이동되었거나 사용되지 않음
    return NextResponse.json({ error: "메소드가 허용되지 않습니다." }, { status: 405 });
}

export async function DELETE(request: Request) {
    // 이 DELETE 함수는 /api/posts/[slug]/route.ts로 이동되었거나 사용되지 않음
    return NextResponse.json({ error: "메소드가 허용되지 않습니다." }, { status: 405 });
}
