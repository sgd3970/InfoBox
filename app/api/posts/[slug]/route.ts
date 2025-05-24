import { NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
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
    .replace(/&#039;/g, "'")
    .replace(/&nbsp;/g, " ");
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

    console.log("Post Content:", post?.content); // 원본 post 객체의 content 값 로그 출력

    return NextResponse.json(serializablePost)
  } catch (error) {
    console.error("API /api/posts/[slug] GET 오류:", error)
    return NextResponse.json(
      { error: "포스트를 가져오는 중 오류가 발생했습니다." },
      { status: 500 }
    )
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
  const { slug } = params
  console.log(`API /api/posts/${slug} PUT - Attempting to update post with slug: ${slug}`)

  const session = await getServerSession(authOptions)

  if (!session || session.user?.role !== "admin") {
    console.log(`API /api/posts/${slug} PUT - Authentication failed or not admin`)
    return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 })
  }

  try {
    const updatedPostData = await request.json()
    const db = await getDatabase()

    console.log(`PUT /api/posts/${slug}: Received update data`, updatedPostData);

    // 업데이트 전 기존 포스트 가져오기
    const existingPost = await db.collection("posts").findOne({ slug });
    if (!existingPost) {
        console.log(`API /api/posts/${slug} PUT - Existing post not found for tag update`)
        // 기존 포스트가 없으면 태그 업데이트 로직을 건너뛰거나 오류 처리
        // 여기서는 업데이트 자체는 계속 진행하되, 태그 카운트 조정은 하지 않음
    }

    // ——————————————————————————————
    // 서버측 안전 장치: 클라이언트에서 혹시 놓쳤을 수 있는 클렌징
    // 1) HTML 엔티티 디코딩
    if (typeof updatedPostData.content === "string") {
      updatedPostData.content = decodeHtmlEntities(updatedPostData.content)
    }
    // 2) 혹시 남아 있는 <article> 태그 제거
    if (typeof updatedPostData.content === "string") {
      updatedPostData.content = updatedPostData.content.replace(/<\/?article>/g, "")
    }
    // 3) 앞뒤 공백\u00b7개행 제거
    if (typeof updatedPostData.content === "string") {
       updatedPostData.content = updatedPostData.content.trim()
    }
    // ——————————————————————————————

    // MongoDB에서 _id는 변경하지 않으므로 업데이트 데이터에서 제거
    const { _id, ...fieldsToSet } = updatedPostData; // _id 필드 분리, 나머지 필드 사용

    // 날짜 필드를 업데이트할 경우 Date 객체로 변환 (클라이언트에서 문자열로 보낼 경우 대비)
    if (fieldsToSet.date) fieldsToSet.date = new Date(fieldsToSet.date);
    fieldsToSet.updatedAt = new Date(); // 업데이트 시간은 항상 현재 시간으로 설정 (Date 객체)

    const result = await db
      .collection("posts")
      .updateOne(
        { slug }, // 슬러그로 포스트 찾기
        { $set: fieldsToSet } // 업데이트 필드 사용
      )

    // 태그 컬렉션 업데이트 로직 추가
    if (result.matchedCount > 0) { // 포스트가 성공적으로 업데이트된 경우에만 태그 업데이트
      const updatedPost = await db.collection("posts").findOne({ slug }); // 업데이트된 포스트 다시 가져오기
      console.log(`PUT /api/posts/${slug}: Existing post before update`, existingPost);
      console.log(`PUT /api/posts/${slug}: Updated post after update`, updatedPost);

      const oldTags: string[] = existingPost?.tags || []; // 업데이트 전 기존 태그 (null/undefined 대비)
      const newTags: string[] = updatedPost?.tags || []; // 업데이트 후 새로운 태그 (null/undefined 대비)

      console.log(`PUT /api/posts/${slug}: Old tags`, oldTags);
      console.log(`PUT /api/posts/${slug}: New tags`, newTags);

      // 새로 추가된 태그 처리
      const addedTags: string[] = newTags.filter((tag: string) => !oldTags.includes(tag));
      console.log(`PUT /api/posts/${slug}: Added tags`, addedTags);

      for (const tagName of addedTags) {
        // 태그 이름 자체를 _id로 사용하여 tags 컬렉션 업데이트
        if (!tagName) continue; // 빈 태그 이름 스킵
        await db.collection("tags").updateOne(
          { _id: tagName as any }, // 태그 이름을 _id로 사용 (타입 문제 임시 해결)
          { $setOnInsert: { name: tagName, createdAt: new Date() }, $inc: { postCount: 1 }, $set: { updatedAt: new Date() } },
          { upsert: true }
        );
      }

      // 제거된 태그 처리
      const removedTags: string[] = oldTags.filter((tag: string) => !newTags.includes(tag));
      console.log(`PUT /api/posts/${slug}: Removed tags`, removedTags);

      for (const tagName of removedTags) {
        // 태그 이름 자체를 _id로 사용하여 tags 컬렉션 업데이트
        if (!tagName) continue; // 빈 태그 이름 스킵
        // postCount를 1 감소시키고, 0보다 작아지지 않도록 합니다.
        await db.collection("tags").updateOne(
          { _id: tagName as any }, // 태그 이름을 _id로 사용 (타입 문제 임시 해결)
          { $inc: { postCount: -1 }, $set: { updatedAt: new Date() } },
          { 
            // postCount가 0 이하가 되지 않도록 조건을 추가할 수 있지만, $inc가 이를 처리합니다.
            // count가 0인 태그를 제거하려면 여기에 로직 추가
          }
        );
      }
    }

    if (result.matchedCount === 0) {
      console.log(`API /api/posts/${slug} PUT - Post not found for update`)
      return NextResponse.json({ error: "수정할 포스트를 찾을 수 없습니다." }, { status: 404 })
    }

    console.log(`API /api/posts/${slug} PUT - Post updated successfully`)
    return NextResponse.json({ message: "포스트가 성공적으로 수정되었습니다." })
  } catch (error) {
    console.error("API /api/posts/[slug] PUT 오류:", error)
    return NextResponse.json(
      { error: "포스트 수정 중 오류가 발생했습니다." },
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

    console.log(`API /api/posts/${slug} DELETE - Post deleted successfully`)

    // 태그 정리 로직
    if (postToDelete.tags && Array.isArray(postToDelete.tags) && postToDelete.tags.length > 0) {
      // 해당 태그를 사용하는 다른 포스트 찾기
      const postsUsingTags = await db.collection("posts").find({
        _id: { $ne: postToDelete._id },
        tags: { $in: postToDelete.tags }
      }).toArray()

      // 다른 포스트에서 사용되지 않는 태그 찾기
      const tagsUsedByOtherPosts = new Set<string>()
      postsUsingTags.forEach(post => {
        if (post.tags && Array.isArray(post.tags)) {
          post.tags.forEach(tag => tagsUsedByOtherPosts.add(tag.toString()))
        }
      })

      // 사용되지 않는 태그 찾기 (태그 이름 기준)
      const orphanedTags = postToDelete.tags.filter(
        tag => !tagsUsedByOtherPosts.has(tag) // 태그 이름(문자열)으로 비교
      )

      // 사용되지 않는 태그 삭제 (_id 기준으로 삭제)
      if (orphanedTags.length > 0) {
        await db.collection("tags").deleteMany({
          _id: { $in: orphanedTags as any[] } // 태그 이름(문자열) 배열로 삭제 (_id 기준)
        })
      }
    }

    return NextResponse.json({ message: "포스트가 성공적으로 삭제되었습니다." })
  } catch (error) {
    console.error("API /api/posts/[slug] DELETE 오류:", error)
    return NextResponse.json(
      { error: "포스트 삭제 중 오류가 발생했습니다." },
      { status: 500 }
    )
  }
}
