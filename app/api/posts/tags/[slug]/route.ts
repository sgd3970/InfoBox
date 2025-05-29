import { NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  console.log('[API] /api/posts/tags/[slug] 진입:', params.slug);
  const db = await getDatabase();
  const tagSlug = decodeURIComponent(params.slug);
  console.log('[API] tagSlug:', tagSlug);

  // 1. slug로 name 찾기
  const tagDoc = await db.collection("tags").findOne({ slug: tagSlug });
  console.log('[API] tagDoc:', tagDoc);
  if (!tagDoc) {
    console.log('[API] 태그 없음, 빈 배열 반환');
    return NextResponse.json([]);
  }
  const tagName = tagDoc.name;
  console.log('[API] tagName:', tagName);
  const tagNameNormalized = tagName.trim().toLowerCase();
  console.log('[API] tagNameNormalized:', tagNameNormalized);

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

  // 모든 포스트의 tags 배열 로그
  const allPosts = await db.collection("posts").find({ published: true }).toArray();
  allPosts.forEach((post, idx) => {
    console.log(`[API] 전체 post[${idx}].tags:`, post.tags);
  });

  // ObjectId를 문자열로 변환
  const formattedPosts = posts.map((post: any) => ({
    ...post,
    _id: post._id?.toString?.() ?? post._id
  }));
  console.log('[API] formattedPosts.length:', formattedPosts.length);

  return NextResponse.json(formattedPosts);
} 