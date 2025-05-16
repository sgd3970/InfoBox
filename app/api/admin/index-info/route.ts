import { NextResponse } from "next/server"
import { getIndexInfo } from "@/lib/db-indexes"

export async function GET() {
  try {
    const indexInfo = await getIndexInfo()

    if (!indexInfo) {
      return NextResponse.json({ error: "인덱스 정보를 가져오는데 실패했습니다." }, { status: 500 })
    }

    return NextResponse.json({ indexInfo })
  } catch (error) {
    console.error("인덱스 정보 API 오류:", error)
    return NextResponse.json({ error: "인덱스 정보를 가져오는 중 오류가 발생했습니다." }, { status: 500 })
  }
}
