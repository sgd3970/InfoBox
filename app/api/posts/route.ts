import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
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
    const featured = searchParams.get("featured")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const skip = (page - 1) * limit

    const client = await clientPromise
    const db = client.db()

    // 필터 조건 구성
    const filter: any = {}
    if (category) filter.category = category
    if (tag) filter.tags = tag
    if (featured === "true") filter.featured = true

    // 포스트 가져오기
    const posts = await db.collection("posts").find(filter).sort({ date: -1 }).skip(skip).limit(limit).toArray()

    // 가져온 포스트 데이터 검증 및 보완
    const sanitizedPosts = posts.map(post => ({
      ...post,
      // 새로운 필드가 없을 경우 기본값 설정
      featuredImage: post.featuredImage === undefined ? null : post.featuredImage,
      images: Array.isArray(post.images) ? post.images : [],
      tags: Array.isArray(post.tags) ? post.tags : [], // tags 필드도 배열인지 확인
      views: post.views === undefined ? 0 : post.views, // views 필드 기본값 설정
      author: post.author === undefined ? "관리자" : post.author, // author 필드 기본값 설정
    }));

    // 총 포스트 수 가져오기
    const total = await db.collection("posts").countDocuments(filter)

    return NextResponse.json({
      posts: sanitizedPosts,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("포스트 가져오기 오류:", error)
    return NextResponse.json({ error: "포스트를 가져오는 중 오류가 발생했습니다." }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session || session.user?.role !== "admin") {
    return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 })
  }

  try {
    const postData = await request.json()
    const client = await clientPromise
    const db = client.db()

    // 필수 필드 검증
    const requiredFields = ["title", "slug", "description", "content", "category"]
    for (const field of requiredFields) {
      if (!postData[field]) {
        return NextResponse.json(
          { error: `${field} 필드는 필수입니다.` },
          { status: 400 }
        )
      }
    }

    // 슬러그 중복 검사
    const existingPost = await db.collection("posts").findOne({
      slug: postData.slug,
    })
    if (existingPost) {
      return NextResponse.json(
        { error: `슬러그 '${postData.slug}'는 이미 존재합니다.` },
        { status: 400 }
      )
    }

    // 포스트 데이터 준비
    const newPost = {
      ...postData,
      author: session.user.name || session.user.email || "관리자", // 세션에서 작성자 정보 가져오기
      views: 0,
      date: new Date(postData.date || Date.now()), // 클라이언트에서 보낸 날짜 사용 또는 현재 시간
      createdAt: new Date(),
      updatedAt: new Date(),
      featured: postData.featured || false, // featured 기본값 설정
      tags: Array.isArray(postData.tags) ? postData.tags : [], // tags가 배열인지 확인
    }

    // 데이터베이스에 포스트 삽입
    const result = await db.collection("posts").insertOne(newPost)

    return NextResponse.json(
      { message: "포스트가 성공적으로 생성되었습니다.", postId: result.insertedId },
      { status: 201 }
    )
  } catch (error) {
    console.error("포스트 생성 오류:", error)
    return NextResponse.json(
      { error: "포스트 생성 중 오류가 발생했습니다." },
      { status: 500 }
    )
  }
}
