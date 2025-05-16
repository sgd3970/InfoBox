import { NextResponse } from "next/server"
import { getConnectionStatus } from "@/lib/mongodb"

export async function GET() {
  try {
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
