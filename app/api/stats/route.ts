import { NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const db = await getDatabase()

    // 통계 데이터 가져오기
    const totalPosts = await db.collection("posts").countDocuments()
    const totalCategories = await db.collection("categories").countDocuments()
    const totalTags = await db.collection("tags").countDocuments()
    const totalUsers = await db.collection("users").countDocuments()
    const totalComments = await db.collection("comments").countDocuments()

    // 총 조회수 계산
    const viewsResult = await db
      .collection("posts")
      .aggregate([{ $group: { _id: null, totalViews: { $sum: "$views" } } }])
      .toArray()
    const totalViews = viewsResult.length > 0 ? viewsResult[0].totalViews : 0

    // 최근 포스트 가져오기
    const recentPosts = await db.collection("posts").find().sort({ date: -1 }).limit(5).toArray()

    // 페이지뷰 추이 데이터 가져오기
    const today = new Date()
    const twoWeeksAgo = new Date(today.getTime() - 14 * 24 * 60 * 60 * 1000)

    const pageViewsData = await db
      .collection("pageviews")
      .find({
        date: {
          $gte: twoWeeksAgo.toISOString().split("T")[0],
          $lte: today.toISOString().split("T")[0],
        },
      })
      .sort({ date: 1 })
      .toArray()

    // 인기 포스트 가져오기
    const topPosts = await db
      .collection("posts")
      .find()
      .sort({ views: -1 })
      .limit(5)
      .project({ title: 1, views: 1, slug: 1, category: 1 })
      .toArray()

    // 트래픽 소스 가져오기
    const topReferrers = await db.collection("referrers").find().sort({ count: -1 }).limit(5).toArray()

    // 디바이스 통계 가져오기
    const deviceStats = await db.collection("devicestats").find().sort({ count: -1 }).toArray()

    return NextResponse.json({
      overview: {
        totalPosts,
        totalCategories,
        totalTags,
        totalUsers,
        totalComments,
        totalViews,
      },
      recentPosts,
      pageViewsData,
      topPosts,
      topReferrers,
      deviceStats,
    })
  } catch (error) {
    console.error("통계 데이터 가져오기 오류:", error)
    return NextResponse.json({ error: "통계 데이터를 가져오는 중 오류가 발생했습니다." }, { status: 500 })
  }
}
