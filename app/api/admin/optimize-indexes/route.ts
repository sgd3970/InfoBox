import { NextResponse } from "next/server"
import { optimizeIndexes, getIndexInfo } from "@/lib/db-indexes"

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // 인덱스 최적화 실행
    const success = await optimizeIndexes()

    if (!success) {
      return NextResponse.json({ error: "인덱스 최적화 중 오류가 발생했습니다." }, { status: 500 })
    }

    // 최적화 후 인덱스 정보 가져오기
    const indexInfo = await getIndexInfo()

    return NextResponse.json({
      success: true,
      message: "데이터베이스 인덱스가 성공적으로 최적화되었습니다.",
      indexInfo,
    })
  } catch (error) {
    console.error("인덱스 최적화 API 오류:", error)
    return NextResponse.json({ error: "인덱스 최적화 중 오류가 발생했습니다." }, { status: 500 })
  }
}
