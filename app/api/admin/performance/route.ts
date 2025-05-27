import { NextResponse } from "next/server"
import { getDatabaseStats } from "@/lib/performance"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getDatabase } from "@/lib/mongodb"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 })
    }

    const db = await getDatabase();

    // 1. 총 방문자(페이지뷰)
    const totalViews = await db.collection("pageviews").aggregate([
      { $group: { _id: null, total: { $sum: "$count" } } }
    ]).toArray();
    const totalViewsCount = totalViews[0]?.total || 0;

    // 2. 총 포스트
    const totalPosts = await db.collection("posts").countDocuments();
    // 3. 총 댓글
    const totalComments = await db.collection("comments").countDocuments();
    // 4. 총 사용자
    const totalUsers = await db.collection("users").countDocuments();

    // 5. 최근 14일간 페이지뷰 추이
    const recentPageViews = await db.collection("pageviews").aggregate([
      { $sort: { date: -1 } },
      { $limit: 14 },
      { $sort: { date: 1 } },
      { $project: { date: 1, count: 1, _id: 0 } }
    ]).toArray();

    // 6. 디바이스 통계 (최근 14일)
    const deviceStats = await db.collection("devicestats").aggregate([
      { $sort: { date: -1 } },
      { $limit: 14 },
      { $group: { _id: "$device", count: { $sum: "$count" } } },
      { $project: { device: "$_id", count: 1, _id: 0 } }
    ]).toArray();

    // 7. 리퍼러 통계 (최근 14일)
    const topReferrers = await db.collection("referrers").aggregate([
      { $sort: { date: -1 } },
      { $limit: 100 },
      { $group: { _id: "$source", count: { $sum: "$count" } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      { $project: { source: "$_id", count: 1, _id: 0 } }
    ]).toArray();

    // 8. 개요
    const overview = {
      totalViews: totalViewsCount,
      totalPosts,
      totalComments,
      totalUsers,
    };

    return NextResponse.json({
      pageViewsData: recentPageViews,
      deviceStats,
      topReferrers,
      overview,
    });
  } catch (error) {
    console.error("성능 데이터 API 오류:", error)
    return NextResponse.json({ error: "성능 데이터를 가져오는 중 오류가 발생했습니다." }, { status: 500 })
  }
}
