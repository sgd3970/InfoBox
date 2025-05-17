import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db()

    // 카테고리별 포스트 수 집계 및 카테고리 정보 결합
    const categoriesWithPostCount = await db.collection("categories").aggregate([
      {
        $lookup: {
          from: "posts",
          let: { categorySlug: "$slug" }, // categories 컬렉션의 slug를 변수로 저장
          pipeline: [
            { // posts 컬렉션에서 category 필드가 변수(categorySlug)와 일치하는 문서 찾기
              $match: {
                $expr: {
                  $eq: [
                    { $toLower: "$category" }, // posts.category를 소문자로 변환
                    { $toLower: "$$categorySlug" }, // categories.slug 변수를 소문자로 변환
                  ],
                },
              },
            },
          ],
          as: "posts", // 조인된 결과가 저장될 필드 이름
        },
      },
      {
        $project: { // 필요한 필드만 선택하고 postCount 계산
          _id: 1,
          name: 1,
          slug: 1,
          description: 1,
          postCount: { $size: "$posts" }, // 조인된 posts 배열의 크기를 postCount로 사용
        },
      },
      { // 이름 순으로 정렬 (기존 로직 유지)
        $sort: { name: 1 },
      },
    ]).toArray()

    // postCount가 0인 카테고리도 반환하려면 위 로직을 사용하고,
    // postCount가 0인 카테고리는 제외하고 싶다면 $match 단계 추가:
    // { $match: { postCount: { $gt: 0 } } },

    return NextResponse.json(categoriesWithPostCount)
  } catch (error) {
    console.error("카테고리 가져오기 오류:", error)
    return NextResponse.json({ error: "카테고리를 가져오는 중 오류가 발생했습니다." }, { status: 500 })
  }
}
