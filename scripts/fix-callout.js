const fs = require("fs")
const path = require("path")

// 콜아웃 컴포넌트 파일 경로
const calloutPath = path.join(process.cwd(), "components/ui/callout.tsx")

// 파일이 존재하는지 확인
if (fs.existsSync(calloutPath)) {
  try {
    // 파일 내용 읽기
    let content = fs.readFileSync(calloutPath, "utf8")

    // Pretendard 폰트 참조 확인 및 수정
    if (content.includes("Pretendard") || content.includes("../../../public/fonts/Pretendard")) {
      console.log("Found Pretendard references in callout.tsx")

      // 폰트 참조 수정
      content = content.replace(/['"]Pretendard['"],?\s*/g, "")
      content = content.replace(/\.\.\/\.\.\/\.\.\/public\/fonts\/Pretendard[^'"]+/g, "/fonts/removed.woff")

      // 수정된 내용 저장
      fs.writeFileSync(calloutPath, content, "utf8")
      console.log("Fixed callout.tsx")
    } else {
      console.log("No Pretendard references found in callout.tsx")
    }
  } catch (err) {
    console.error("Error processing callout.tsx:", err)
  }
} else {
  console.log("callout.tsx not found")
}
