import { NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export const dynamic = "force-dynamic"

// 사용자 목록 가져오기
export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session || session.user?.role !== "admin") {
    return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 })
  }

  try {
    const db = await getDatabase()
    
    // 사용자 목록 가져오기 (가입일순)
    const users = await db
      .collection("users")
      .find({}, { projection: { password: 0 } }) // 비밀번호 제외
      .sort({ createdAt: -1 })
      .toArray()

    return NextResponse.json(users)
  } catch (error) {
    console.error("사용자 가져오기 오류:", error)
    return NextResponse.json(
      { error: "사용자를 가져오는 중 오류가 발생했습니다." },
      { status: 500 }
    )
  }
}

// 새 사용자 추가
export async function POST(request: Request) {
  try {
    // 세션 확인
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "권한이 없습니다." },
        { status: 403 }
      )
    }

    const { name, email, password, role } = await request.json()

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "필수 정보가 누락되었습니다." },
        { status: 400 }
      )
    }

    const db = await getDatabase()

    // 이메일 중복 확인
    const existingUser = await db.collection("users").findOne({ email })
    if (existingUser) {
      return NextResponse.json(
        { error: "이미 사용 중인 이메일입니다." },
        { status: 400 }
      )
    }

    // 새 사용자 추가
    const result = await db.collection("users").insertOne({
      name,
      email,
      password, // TODO: 비밀번호 해싱 추가
      role: role || "user",
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    return NextResponse.json({
      message: "사용자가 추가되었습니다.",
      userId: result.insertedId,
    })
  } catch (error) {
    console.error("사용자 추가 오류:", error)
    return NextResponse.json(
      { error: "사용자를 추가하는 중 오류가 발생했습니다." },
      { status: 500 }
    )
  }
}

// 사용자 정보 수정
export async function PUT(request: Request) {
  try {
    // 세션 확인
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "권한이 없습니다." },
        { status: 403 }
      )
    }

    const { id, name, email, role } = await request.json()

    if (!id || !name || !email) {
      return NextResponse.json(
        { error: "필수 정보가 누락되었습니다." },
        { status: 400 }
      )
    }

    const db = await getDatabase()

    // 이메일 중복 확인 (자기 자신 제외)
    const existingUser = await db.collection("users").findOne({
      email,
      _id: { $ne: new ObjectId(id) },
    })
    if (existingUser) {
      return NextResponse.json(
        { error: "이미 사용 중인 이메일입니다." },
        { status: 400 }
      )
    }

    // 사용자 정보 수정
    const result = await db.collection("users").updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          name,
          email,
          role,
          updatedAt: new Date(),
        },
      }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: "사용자를 찾을 수 없습니다." },
        { status: 404 }
      )
    }

    return NextResponse.json({ message: "사용자 정보가 수정되었습니다." })
  } catch (error) {
    console.error("사용자 수정 오류:", error)
    return NextResponse.json(
      { error: "사용자 정보를 수정하는 중 오류가 발생했습니다." },
      { status: 500 }
    )
  }
}

// 사용자 삭제
export async function DELETE(request: Request) {
  try {
    // 세션 확인
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "권한이 없습니다." },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json(
        { error: "사용자 ID가 필요합니다." },
        { status: 400 }
      )
    }

    const db = await getDatabase()

    // 관리자 계정은 삭제 불가
    const user = await db.collection("users").findOne({ _id: new ObjectId(id) })
    if (user?.role === "admin") {
      return NextResponse.json(
        { error: "관리자 계정은 삭제할 수 없습니다." },
        { status: 400 }
      )
    }

    const result = await db.collection("users").deleteOne({
      _id: new ObjectId(id),
    })

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: "사용자를 찾을 수 없습니다." },
        { status: 404 }
      )
    }

    return NextResponse.json({ message: "사용자가 삭제되었습니다." })
  } catch (error) {
    console.error("사용자 삭제 오류:", error)
    return NextResponse.json(
      { error: "사용자를 삭제하는 중 오류가 발생했습니다." },
      { status: 500 }
    )
  }
} 