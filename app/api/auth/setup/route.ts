import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import bcrypt from "bcryptjs"

export async function POST() {
  try {
    const client = await clientPromise
    const db = client.db()

    const adminEmail = "zbehddl@gmail.com"; // 변경할 이메일

    // 이미 관리자 계정이 있는지 확인
    const existingAdmin = await db.collection("users").findOne({
      email: adminEmail,
    })

    if (existingAdmin) {
      return NextResponse.json(
        { message: "관리자 계정이 이미 존재합니다." },
        { status: 200 }
      )
    }

    // 비밀번호 해시화
    const hashedPassword = await bcrypt.hash("14jj78jj9!", 10)

    // 관리자 계정 생성
    await db.collection("users").insertOne({
      name: "관리자", // 이름은 원하시는 대로 변경 가능
      email: adminEmail, // 변경할 이메일 적용
      password: hashedPassword,
      role: "admin",
      createdAt: new Date(),
    })

    return NextResponse.json(
      { message: "관리자 계정이 생성되었습니다." },
      { status: 201 }
    )
  } catch (error) {
    console.error("관리자 계정 생성 중 오류:", error)
    return NextResponse.json(
      { error: "관리자 계정 생성에 실패했습니다." },
      { status: 500 }
    )
  }
}