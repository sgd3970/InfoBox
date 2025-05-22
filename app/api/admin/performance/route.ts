import { NextResponse } from "next/server"
import { getDatabaseStats } from "@/lib/performance"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 })
    }

    const stats = await getDatabaseStats()
    if (!stats) {
      return NextResponse.json({ error: "성능 데이터를 가져오는데 실패했습니다." }, { status: 500 })
    }

    return NextResponse.json({ stats })
  } catch (error) {
    console.error("성능 데이터 API 오류:", error)
    return NextResponse.json({ error: "성능 데이터를 가져오는 중 오류가 발생했습니다." }, { status: 500 })
  }
}
