import { NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { ObjectId, WithId, Document } from "mongodb"
import type { Post } from "@/lib/models"

export const dynamic = "force-dynamic"

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  console.log('[API] 라우트 진입:', params.slug)
  try {
    const db = await getDatabase()
    const tagSlug = decodeURIComponent(params.slug)
    console.log('[API] tagSlug:', tagSlug)

    // 1. slug로 name 찾기
    const tagDoc = await db.collection("tags").findOne({ slug: tagSlug })
    console.log('[API] tagDoc:', tagDoc)
    if (!tagDoc) {
      console.log('[API] 태그 없음, 빈 배열 반환')
      return NextResponse.json([])
    }
    const tagName = tagDoc.name
    console.log('[API] tagName:', tagName)
    const tagNameNormalized = tagName.trim().toLowerCase()
    console.log('[API] tagNameNormalized:', tagNameNormalized)

    // 전체 posts의 tags 배열 로그 (10개까지만)
    const allPosts = await db.collection("posts").find({ published: true }).toArray();
    console.log('[API] 전체 posts 개수:', allPosts.length);
    allPosts.slice(0, 10).forEach((post, idx) => {
      console.log(`[API] 전체 post[${idx}].tags:`, post.tags);
    });
    if (allPosts.length > 10) {
      console.log(`[API] ...이하 생략 (총 ${allPosts.length}개)`);
    }

    // 2. posts.tags(string[])에 name이 포함된 포스트 찾기 (공백/대소문자 무시)
    const posts = await db.collection("posts").aggregate([
      { $match: { published: true } },
      { $addFields: {
          tagsNormalized: {
            $map: {
              input: "$tags",
              as: "t",
              in: { $trim: { input: { $toLower: "$$t" } } }
            }
          }
        }
      },
      { $match: { tagsNormalized: tagNameNormalized } },
      { $sort: { date: -1 } }
    ]).toArray() as any[];
    console.log('[API] posts.length:', posts.length);
    posts.forEach((post, idx) => {
      console.log(`[API] post[${idx}].tags:`, post.tags);
      console.log(`[API] post[${idx}].tagsNormalized:`, post.tagsNormalized);
      console.log(`[API] 비교결과:`, post.tagsNormalized?.includes(tagNameNormalized));
    });
    if (posts.length > 0) {
      console.log('[API] posts[0] 예시:', posts[0]);
    }

    // ObjectId를 문자열로 변환
    const formattedPosts = posts.map((post: any) => ({
      ...post,
      _id: post._id?.toString?.() ?? post._id
    }));
    console.log('[API] formattedPosts.length:', formattedPosts.length);

    return NextResponse.json(formattedPosts)
  } catch (error) {
    console.error("태그별 게시물 조회 중 오류 발생:", error)
    return NextResponse.json(
      { error: "태그별 게시물을 가져오는 중 오류가 발생했습니다." },
      { status: 500 }
    )
  }
} 