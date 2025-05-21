import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const postSlug = searchParams.get("postSlug")

    if (!postSlug) {
      return NextResponse.json({ error: "포스트 슬러그가 필요합니다." }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db()

    // 댓글 가져오기 (비밀번호 제외)
    const comments = await db
      .collection("comments")
      .find(
        { postSlug },
        { projection: { password: 0 } } // 비밀번호 필드 제외 유지
      )
      .sort({ createdAt: -1 })
      .toArray()

    return NextResponse.json(comments)
  } catch (error) {
    console.error("댓글 가져오기 오류:", error)
    return NextResponse.json({ error: "댓글을 가져오는 중 오류가 발생했습니다." }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    // isPrivate 필드 제거
    const { postSlug, nickname, password, content } = await request.json()

    // 비밀번호 필드 필수 추가
    if (!postSlug || !nickname || !password || !content) {
      return NextResponse.json(
        { error: "포스트 슬러그, 닉네임, 비밀번호, 내용은 필수입니다." },
        { status: 400 }
      )
    }

    // 비밀번호 4자리 숫자 유효성 검사 (선택 사항이지만, 클라이언트와 일관성 유지)
    if (password.length !== 4 || !/^\d+$/.test(password)) {
        return NextResponse.json({ error: "비밀번호는 4자리 숫자여야 합니다." }, { status: 400 });
    }

    const client = await clientPromise
    const db = client.db()

    // 포스트 확인
    const post = await db.collection("posts").findOne({ slug: postSlug })
    if (!post) {
      return NextResponse.json({ error: "존재하지 않는 포스트입니다." }, { status: 404 })
    }

    // 댓글 작성
    const comment = {
      postId: post._id.toString(),
      postSlug,
      nickname,
      password, // 비밀번호 필수이므로 그대로 저장
      content,
      // isPrivate 필드 제거
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await db.collection("comments").insertOne(comment)

    // 응답에서는 비밀번호 제외
    const { password: _, ...commentWithoutPassword } = comment

    return NextResponse.json({
      _id: result.insertedId,
      ...commentWithoutPassword,
    })
  } catch (error) {
    console.error("댓글 작성 오류:", error)
    return NextResponse.json({ error: "댓글을 작성하는 중 오류가 발생했습니다." }, { status: 500 })
  }
}

// 댓글 삭제 API (DELETE 메소드 추가)
export async function DELETE(request: Request) {
    try {
        const url = new URL(request.url);
        const commentId = url.pathname.split('/').pop(); // URL에서 댓글 ID 추출
        const { password } = await request.json();

        if (!commentId || !password) {
            return NextResponse.json({ error: "댓글 ID와 비밀번호가 필요합니다." }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db();

        // 댓글 삭제 (ID와 비밀번호 일치 시)
        const result = await db.collection('comments').deleteOne({
            _id: new (require('mongodb').ObjectId)(commentId), // MongoDB ObjectId로 변환
            password: password // 입력된 비밀번호와 일치하는지 확인
        });

        if (result.deletedCount === 0) {
            return NextResponse.json({ error: "댓글을 찾을 수 없거나 비밀번호가 일치하지 않습니다." }, { status: 404 });
        }

        return NextResponse.json({ message: "댓글이 성공적으로 삭제되었습니다." });

    } catch (error) {
        console.error('댓글 삭제 오류:', error);
        return NextResponse.json({ error: "댓글 삭제 중 오류가 발생했습니다." }, { status: 500 });
    }
}
