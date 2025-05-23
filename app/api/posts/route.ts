import { NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export const dynamic = "force-dynamic"

// HTML 엔티티를 디코딩하는 헬퍼 함수
function decodeHtmlEntities(html: string) {
  if (!html) return '';
  return html
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'");
}

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
  const session = await getServerSession(authOptions)

  if (!session || session.user?.role !== "admin") {
    console.log("API /api/posts POST - Authentication failed or not admin")
    return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 })
  }

  try {
    const postData = await request.json()
    const db = await getDatabase()

    // content 필드의 HTML 엔티티를 실제 태그로 바꿔 줍니다.
    if (typeof postData.content === 'string') {
      postData.content = decodeHtmlEntities(postData.content);
    }

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

    // 포스트 데이터 준비 및 날짜 필드를 Date 객체로 명시적으로 변환
    const newPost = {
      ...postData,
      author: session.user.name || session.user.email || "관리자", // 세션에서 작성자 정보 가져오기
      views: 0,
      date: new Date(postData.date || Date.now()), // 클라이언트에서 보낸 날짜 사용 또는 현재 시간 (Date 객체)
      createdAt: new Date(), // 생성 시간 (Date 객체)
      updatedAt: new Date(), // 업데이트 시간 (Date 객체)
      featured: postData.featured || false, // featured 기본값 설정
      tags: Array.isArray(postData.tags) ? postData.tags : [], // tags가 배열인지 확인
    }

    // 데이터베이스에 포스트 삽입
    const result = await db.collection("posts").insertOne(newPost)

    console.log("API /api/posts POST - Post created successfully")
    return NextResponse.json(
      { message: "포스트가 성공적으로 생성되었습니다.", postId: result.insertedId },
      { status: 201 }
    )
  } catch (error) {
    console.error("API /api/posts POST 오류:", error)
    return NextResponse.json(
      { error: "포스트 생성 중 오류가 발생했습니다." },
      { status: 500 }
    )
  }
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
