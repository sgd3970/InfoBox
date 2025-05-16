const fs = require("fs")
const path = require("path")

// contentlayer.config.ts 파일 경로
const configPath = path.join(process.cwd(), "contentlayer.config.ts")

// 파일이 존재하는지 확인
if (fs.existsSync(configPath)) {
  try {
    // 파일 내용 읽기
    let content = fs.readFileSync(configPath, "utf8")

    // Pretendard 폰트 참조 확인 및 수정
    if (content.includes("Pretendard") || content.includes("../../../public/fonts/Pretendard")) {
      console.log("Found Pretendard references in contentlayer.config.ts")

      // 폰트 참조 수정
      content = content.replace(/['"]Pretendard['"],?\s*/g, "")
      content = content.replace(/\.\.\/\.\.\/\.\.\/public\/fonts\/Pretendard[^'"]+/g, "/fonts/removed.woff")

      // 수정된 내용 저장
      fs.writeFileSync(configPath, content, "utf8")
      console.log("Fixed contentlayer.config.ts")
    } else {
      console.log("No Pretendard references found in contentlayer.config.ts")
    }
  } catch (err) {
    console.error("Error processing contentlayer.config.ts:", err)
  }
} else {
  console.log("contentlayer.config.ts not found")
}
