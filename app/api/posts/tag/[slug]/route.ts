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

    // 태그 컬렉션의 모든 태그 목록 로그
    console.log('[API] 모든 태그 목록 확인:')
    const allTags = await db.collection("tags").find({}).toArray()
    console.log(allTags.map((t: any) => ({ name: t.name, slug: t.slug })))

    // 모든 포스트 가져오기 (조건 없이)
    console.log('[API] 모든 포스트 가져오기 시도:')
    const allPostsNoCondition = await db.collection("posts").find({}).toArray();
    console.log('[API] 조건 없이 가져온 posts 개수:', allPostsNoCondition.length);
    allPostsNoCondition.forEach((post, idx) => {
      console.log(`[API] 포스트[${idx}] 상세 정보:`);
      console.log('title:', post.title);
      console.log('published:', post.published);
      console.log('published 타입:', typeof post.published);
      console.log('tags:', post.tags);
      console.log('date:', post.date);
      console.log('category:', post.category);
      console.log('---');
    });

    // 전체 posts의 tags 배열 로그 (10개까지만)
    const postsData = await db.collection("posts").find({ published: true }).toArray();
    console.log('[API] 전체 posts 개수:', postsData.length);
    postsData.slice(0, 10).forEach((post, idx) => {
      console.log(`[API] 전체 post[${idx}].tags:`, post.tags);
    });
    if (postsData.length > 10) {
      console.log(`[API] ...이하 생략 (총 ${postsData.length}개)`);
    }

    // 2. posts.tags(string[])에 name이 포함된 포스트 찾기 (공백/대소문자 무시)
    console.log('[API] posts 컬렉션의 모든 데이터 확인:')
    console.log('총 포스트 수:', postsData.length)
    
    // 각 포스트의 태그 정보 로그
    postsData.forEach((post: any, idx: number) => {
      console.log(`[API] 포스트[${idx}] 태그 정보:`)
      console.log('원본 태그:', post.tags)
      console.log('소문자 변환:', post.tags?.map((t: string) => t.toLowerCase()) || [])
      console.log('공백 제거:', post.tags?.map((t: string) => t.trim()) || [])
      console.log('정규화된 태그:', post.tags?.map((t: string) => t.trim().toLowerCase()) || [])
    })

    // published 필드가 없거나 true인 포스트만 가져오기
    const posts = await db.collection("posts").aggregate([
      { $match: { $or: [
        { published: { $exists: false } },
        { published: true }
      ] } },
      { 
        $addFields: {
          // 태그 배열의 각 요소를 소문자로 변환하고 공백 제거
          tagsNormalized: {
            $map: {
              input: "$tags",
              as: "t",
              in: { $trim: { input: { $toLower: "$$t" } } }
            }
          }
        }
      },
      // tagsNormalized 배열에 tagNameNormalized가 포함되어 있는지 확인
      { 
        $match: { 
          tagsNormalized: { $elemMatch: { $eq: tagNameNormalized } } 
        } 
      },
      { $sort: { date: -1 } }
    ]).toArray() as any[];
    console.log('[API] 최종 필터링된 posts.length:', posts.length);
    if (posts.length > 0) {
      console.log('[API] 최종 필터링된 포스트 예시:')
      posts.forEach((post, idx) => {
        console.log(`[API] 포스트[${idx}] 상세 정보:`)
        console.log('title:', post.title)
        console.log('tags:', post.tags)
        console.log('tagsNormalized:', post.tagsNormalized)
        console.log('비교 결과:', post.tagsNormalized?.includes(tagNameNormalized))
      })
    } else {
      console.log('[API] 필터링된 포스트가 없습니다.')
      console.log('[API] 모든 포스트의 태그 정보 확인:')
      const allPosts = await db.collection("posts").find({ published: true }).toArray()
      allPosts.forEach((post: WithId<Document>, idx) => {
        console.log(`[API] 포스트[${idx}] 태그 정보:`)
        console.log('원본 태그:', post.tags)
        console.log('정규화된 태그:', post.tags?.map((t: string) => t.trim().toLowerCase()) || [])
        console.log('비교 결과:', (post.tags?.map((t: string) => t.trim().toLowerCase()) || []).includes(tagNameNormalized))
      })
    }
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