import { NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session || session.user?.role !== "admin") {
    console.log("API /api/revalidate POST - Authentication failed or not admin")
    return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 })
  }

  try {
    const { path } = await request.json()

    if (!path) {
      return NextResponse.json(
        { error: "revalidate할 경로가 필요합니다." },
        { status: 400 }
      )
    }

    revalidatePath(path)
    console.log(`API /api/revalidate POST - Revalidated path: ${path}`)
    return NextResponse.json({ revalidated: true, message: "캐시가 성공적으로 갱신되었습니다." })
  } catch (error) {
    console.error("API /api/revalidate POST 오류:", error)
    return NextResponse.json(
      { error: "캐시 갱신 중 오류가 발생했습니다." },
      { status: 500 }
    )
  }
} 