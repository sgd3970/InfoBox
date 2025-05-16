const fs = require("fs")
const path = require("path")

// 코드 블록 컴포넌트 파일 경로
const codeBlockPath = path.join(process.cwd(), "components/ui/code-block.tsx")

// 파일이 존재하는지 확인
if (fs.existsSync(codeBlockPath)) {
  try {
    // 파일 내용 읽기
    let content = fs.readFileSync(codeBlockPath, "utf8")

    // Pretendard 폰트 참조 확인 및 수정
    if (content.includes("Pretendard") || content.includes("../../../public/fonts/Pretendard")) {
      console.log("Found Pretendard references in code-block.tsx")

      // 폰트 참조 수정
      content = content.replace(/['"]Pretendard['"],?\s*/g, "")
      content = content.replace(/\.\.\/\.\.\/\.\.\/public\/fonts\/Pretendard[^'"]+/g, "/fonts/removed.woff")

      // 수정된 내용 저장
      fs.writeFileSync(codeBlockPath, content, "utf8")
      console.log("Fixed code-block.tsx")
    } else {
      console.log("No Pretendard references found in code-block.tsx")
    }
  } catch (err) {
    console.error("Error processing code-block.tsx:", err)
  }
} else {
  console.log("code-block.tsx not found")
}
