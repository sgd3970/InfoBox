import { NextResponse } from "next/server"
import { getConnectionStatus } from "@/lib/mongodb"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 })
    }

    const connectionStatus = await getConnectionStatus()
    if (!connectionStatus) {
      return NextResponse.json({ error: "연결 상태를 가져오는데 실패했습니다." }, { status: 500 })
    }

    return NextResponse.json({ connectionStatus })
  } catch (error) {
    console.error("연결 상태 API 오류:", error)
    return NextResponse.json({ error: "연결 상태를 가져오는 중 오류가 발생했습니다." }, { status: 500 })
  }
}
