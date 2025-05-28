import { NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import type { Db } from "mongodb"
import sanitizeHtml from "sanitize-html"

export const dynamic = "force-dynamic"

// HTML 엔티티를 디코딩하는 헬퍼 함수
function decodeHtmlEntities(html: string) {
  return html.replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
}

// HTML 정제 함수
function cleanHtml(html: string) {
  // 1. HTML 엔티티 복원
  const decodedHtml = decodeHtmlEntities(html)
  
  // 2. sanitize-html로 기본 정제
  const safeHtml = sanitizeHtml(decodedHtml, {
    allowedTags: [
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'p', 'br', 'hr',
      'ul', 'ol', 'li',
      'strong', 'em', 'u', 's', 'code',
      'a', 'img',
      'blockquote', 'pre',
      'table', 'thead', 'tbody', 'tr', 'th', 'td',
      'div', 'span'
    ],
    allowedAttributes: {
      '*': ['class', 'style'],
      'a': ['href', 'target', 'rel'],
      'img': ['src', 'alt', 'width', 'height']
    },
    // 빈 태그는 무조건 제거
    allowedEmptyTags: [],
    // 텍스트가 전혀 없는 p 태그 필터링
    exclusiveFilter: (frame: { tag: string; text: string }) => {
      return frame.tag === 'p' && !frame.text.trim()
    },
    // 텍스트 노드 사이의 빈 줄들로 p 생성하는 동작 방지
    parser: {
      lowerCaseTags: true,
      recognizeSelfClosing: true
    }
  })

  // 3. 블록 요소를 감싸는 p 태그만 언랩
  const unwrappedHtml = safeHtml
    // 블록 요소를 감싸는 p 태그 언랩
    .replace(/<p>\s*(<(?:h[1-6]|div|table|ul|ol|blockquote|pre)[\s\S]+?>)/g, '$1')
    .replace(/(<\/(?:h[1-6]|div|table|ul|ol|blockquote|pre)>)\s*<\/p>/g, '$1')
    // 연속된 줄바꿈 정리
    .replace(/\n\s*\n/g, '\n')
    // 앞뒤 공백 제거
    .trim()

  return unwrappedHtml
}

// 특정 포스트 가져오기 (GET 함수 수정)
export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  const { slug } = params
  console.log(`API /api/posts/${slug} GET - Fetching post with slug: ${slug}`)

  try {
    const db = await getDatabase()
    const post = await db.collection("posts").findOne({ slug })

    if (!post) {
      console.log(`API /api/posts/${slug} GET - Post not found`)
      return NextResponse.json({ error: "포스트를 찾을 수 없습니다." }, { status: 404 })
    }

    console.log(`API /api/posts/${slug} GET - Post found`)
    
    // _id를 문자열로 변환하여 반환 및 content 필드 포함
    const serializablePost = post ? { ...post, _id: post._id.toString() } : null;
    // content는 그대로 반환 (escape/디코딩 없이)
    return NextResponse.json(serializablePost)
  } catch (error) {
    console.error("API /api/posts/[slug] GET 오류:", error)
    return NextResponse.json(
      { error: "포스트를 가져오는 중 오류가 발생했습니다." },
      { status: 500 }
    )
  }
}

// --- [추가] 태그 동기화 유틸 함수 ---
async function syncTagsCollection(db: Db, allTags: string[]) {
  // 현재 tags 컬렉션의 모든 태그 이름을 가져옴
  const existingTags = await db.collection("tags").find({}, { projection: { name: 1 } }).toArray();
  const existingTagNames = new Set((existingTags as any[]).map((t) => t.name));
  const allTagSet = new Set(allTags);

  // 추가해야 할 태그: posts.tags에는 있지만 tags 컬렉션에는 없는 것
  const tagsToAdd = Array.from(allTagSet).filter((tag) => !existingTagNames.has(tag));
  if (tagsToAdd.length > 0) {
    await db.collection("tags").insertMany(tagsToAdd.map((tag) => ({ name: tag })));
  }

  // 삭제해야 할 태그: tags 컬렉션에는 있지만 posts.tags에는 없는 것
  const tagsToRemove = Array.from(existingTagNames).filter((tag) => !allTagSet.has(tag));
  if (tagsToRemove.length > 0) {
    await db.collection("tags").deleteMany({ name: { $in: tagsToRemove } });
  }
}

// 새 포스트 생성 (POST 함수 수정)
export async function POST(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session || session.user?.role !== "admin") {
    console.log("API /api/posts POST - Authentication failed or not admin")
    return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 })
  }

  try {
    const postData = await request.json()
    const db = await getDatabase()

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

    // [추가] 태그 동기화
    const allPosts = await db.collection("posts").find({}, { projection: { tags: 1 } }).toArray();
    const allTags = Array.from(new Set(allPosts.flatMap(p => p.tags || [])));
    await syncTagsCollection(db, allTags);

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

// 포스트 수정 (PUT 함수 수정)
export async function PUT(
  request: Request,
  { params }: { params: { slug: string } }
) {
  const session = await getServerSession(authOptions)

  if (!session || session.user?.role !== "admin") {
    console.log("API /api/posts/[slug] PUT - Authentication failed or not admin")
    return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 })
  }

  try {
    const postData = await request.json()
    console.log('[PUT] postData:', postData)
    const db = await getDatabase()

    // HTML 정제
    if (typeof postData.content === "string") {
      postData.content = cleanHtml(postData.content)
    }

    // 필수 필드 검증
    const requiredFields = ["title", "slug", "description", "content", "category"]
    for (const field of requiredFields) {
      if (!postData[field]) {
        console.log('[PUT] 필수 필드 누락:', field, postData[field])
        return NextResponse.json(
          { error: `${field} 필드는 필수입니다.` },
          { status: 400 }
        )
      }
    }

    // _id 타입 변환
    let objectId = postData._id
    if (typeof objectId === 'string') {
      try {
        objectId = new ObjectId(objectId)
      } catch (e) {
        console.log('[PUT] _id ObjectId 변환 실패:', postData._id)
        return NextResponse.json({ error: '_id 변환 오류' }, { status: 400 })
      }
    }
    console.log('[PUT] objectId:', objectId)

    // 슬러그 중복 검사 (자기 자신 제외)
    const existingPost = await db.collection("posts").findOne({
      slug: postData.slug,
      _id: { $ne: objectId },
    })
    console.log('[PUT] existingPost:', existingPost)
    if (existingPost) {
      console.log('[PUT] 슬러그 중복:', postData.slug)
      return NextResponse.json(
        { error: `슬러그 '${postData.slug}'는 이미 존재합니다.` },
        { status: 400 }
      )
    }

    // _id를 $set에서 제외
    const { _id, ...fieldsToUpdate } = postData;
    const updatedPost = {
      ...fieldsToUpdate,
      updatedAt: new Date(), // 업데이트 시간 (Date 객체)
      tags: Array.isArray(postData.tags) ? postData.tags : [], // tags가 배열인지 확인
    }
    console.log('[PUT] updatedPost:', updatedPost)

    // 데이터베이스에서 포스트 업데이트
    const result = await db.collection("posts").updateOne(
      { _id: objectId },
      { $set: updatedPost }
    )
    console.log('[PUT] updateOne result:', result)

    if (result.matchedCount === 0) {
      console.log('[PUT] 포스트를 찾을 수 없습니다:', objectId)
      return NextResponse.json(
        { error: "포스트를 찾을 수 없습니다." },
        { status: 404 }
      )
    }

    // [추가] 태그 동기화
    const allPostsPut = await db.collection("posts").find({}, { projection: { tags: 1 } }).toArray();
    const allTagsPut = Array.from(new Set(allPostsPut.flatMap(p => p.tags || [])));
    await syncTagsCollection(db, allTagsPut);

    console.log("API /api/posts/[slug] PUT - Post updated successfully")
    return NextResponse.json(
      { message: "포스트가 성공적으로 업데이트되었습니다." },
      { status: 200 }
    )
  } catch (error) {
    console.error("API /api/posts/[slug] PUT 오류:", error)
    return NextResponse.json(
      { error: "포스트 업데이트 중 오류가 발생했습니다." },
      { status: 500 }
    )
  }
}

// 포스트 삭제 (DELETE 함수 유지)
export async function DELETE(
  request: Request,
  { params }: { params: { slug: string } }
) {
  const { slug } = params
  console.log(`API /api/posts/${slug} DELETE - Attempting to delete post with slug: ${slug}`)

  const session = await getServerSession(authOptions)

  if (!session || session.user?.role !== "admin") {
    console.log(`API /api/posts/${slug} DELETE - Authentication failed or not admin`)
    return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 })
  }

  try {
    const db = await getDatabase()

    // 먼저 삭제할 포스트를 찾습니다
    const postToDelete = await db.collection("posts").findOne({ slug })
    
    if (!postToDelete) {
      console.log(`API /api/posts/${slug} DELETE - Post not found for deletion`)
      return NextResponse.json({ error: "삭제할 포스트를 찾을 수 없습니다." }, { status: 404 })
    }

    // 포스트 삭제
    const result = await db.collection("posts").deleteOne({ slug })

    if (result.deletedCount === 0) {
      console.log(`API /api/posts/${slug} DELETE - Failed to delete post`)
      return NextResponse.json({ error: "포스트 삭제에 실패했습니다." }, { status: 500 })
    }

    // 포스트 삭제 후 태그 동기화
    const allPostsDel = await db.collection("posts").find({}, { projection: { tags: 1 } }).toArray();
    const allTagsDel = Array.from(new Set(allPostsDel.flatMap(p => p.tags || [])));
    await syncTagsCollection(db, allTagsDel);

    console.log(`API /api/posts/${slug} DELETE - Post deleted successfully`)
    return NextResponse.json({ message: "포스트가 성공적으로 삭제되었습니다." })
  } catch (error) {
    console.error("API /api/posts/[slug] DELETE 오류:", error)
    return NextResponse.json(
      { error: "포스트 삭제 중 오류가 발생했습니다." },
      { status: 500 }
    )
  }
}
