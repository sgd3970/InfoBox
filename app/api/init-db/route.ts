import { NextResponse } from "next/server"
import { initDatabase, seedDatabase } from "@/lib/db-init"

export async function GET() {
  try {
    // 데이터베이스 초기화
    await initDatabase()

    // 데이터베이스 시드 데이터 삽입
    await seedDatabase()

    return NextResponse.json({ success: true, message: "데이터베이스 초기화 및 시드 작업이 완료되었습니다." })
  } catch (error) {
    console.error("데이터베이스 초기화 오류:", error)
    return NextResponse.json({ error: "데이터베이스 초기화 중 오류가 발생했습니다." }, { status: 500 })
  }
}
