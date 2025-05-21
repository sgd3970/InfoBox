import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export const dynamic = "force-dynamic"

// 특정 포스트 가져오기 (GET 함수 유지)
export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  const { slug } = params
  console.log(`API /api/posts/${slug} GET - Fetching post with slug: ${slug}`)

  try {
    const client = await clientPromise
    const db = client.db()
    const post = await db.collection("posts").findOne({ slug })

    if (!post) {
      console.log(`API /api/posts/${slug} GET - Post not found`)
      return NextResponse.json({ error: "포스트를 찾을 수 없습니다." }, { status: 404 })
    }

    console.log(`API /api/posts/${slug} GET - Post found`)
    return NextResponse.json(post)
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
    const client = await clientPromise
    const db = client.db()

    // MongoDB에서 _id는 변경하지 않으므로 업데이트 데이터에서 제거
    const { _id, ...fieldsToUpdate } = updatedPostData;

    // 날짜 필드를 업데이트할 경우 Date 객체로 변환 (클라이언트에서 문자열로 보낼 경우 대비)
    if (fieldsToUpdate.date) fieldsToUpdate.date = new Date(fieldsToUpdate.date);
    fieldsToUpdate.updatedAt = new Date(); // 업데이트 시간은 항상 현재 시간으로 설정 (Date 객체)

    const result = await db
      .collection("posts")
      .updateOne(
        { slug }, // 슬러그로 포스트 찾기
        { $set: fieldsToUpdate } // _id를 제외한 필드 업데이트
      )

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
    const client = await clientPromise
    const db = client.db()

    const result = await db.collection("posts").deleteOne({ slug })

    if (result.deletedCount === 0) {
      console.log(`API /api/posts/${slug} DELETE - Post not found for deletion`)
      return NextResponse.json({ error: "삭제할 포스트를 찾을 수 없습니다." }, { status: 404 })
    }

    console.log(`API /api/posts/${slug} DELETE - Post deleted successfully`)

    // Get the deleted post
    const deletedPost = await db.collection("posts").findOne({ slug })
    if (!deletedPost) {
      return NextResponse.json({ message: "Post not found" }, { status: 404 });
    }

    // Get the tags from the deleted post
    const tagsToDelete = deletedPost.tags;

    // Find all posts that use the tags from the deleted post, excluding the deleted post itself
    const postsUsingTags = await db.collection("posts").find({
      _id: { $ne: deletedPost._id }, // Exclude the deleted post
      tags: { $in: tagsToDelete }, // Find posts using any of the tags
    }).toArray();

    // Get all tags used by the remaining posts
    const tagsUsedByOtherPosts = postsUsingTags.reduce((acc, post) => {
      post.tags.forEach((tag: string) => acc.add(tag.toString())); // Convert ObjectId to string for comparison
      return acc;
    }, new Set<string>());

    // Find tags that are in the deleted post's tags but not used by any other post
    const orphanedTagIds = tagsToDelete.filter(
      (tagId: string) => !tagsUsedByOtherPosts.has(tagId.toString())
    );

    // Delete the orphaned tags
    if (orphanedTagIds.length > 0) {
      await db.collection("tags").deleteMany({ _id: { $in: orphanedTagIds } });
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
