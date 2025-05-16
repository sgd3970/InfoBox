import { NextResponse } from "next/server"
import { getSecuritySettings, getDatabaseUsers, getBackupStatus } from "@/lib/db-security"

export async function GET() {
  try {
    const securitySettings = await getSecuritySettings()
    const databaseUsers = await getDatabaseUsers()
    const backupStatus = await getBackupStatus()

    if (!securitySettings) {
      return NextResponse.json({ error: "보안 설정을 가져오는데 실패했습니다." }, { status: 500 })
    }

    return NextResponse.json({
      securitySettings,
      databaseUsers,
      backupStatus,
    })
  } catch (error) {
    console.error("보안 설정 API 오류:", error)
    return NextResponse.json({ error: "보안 설정을 가져오는 중 오류가 발생했습니다." }, { status: 500 })
  }
}
