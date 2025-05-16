const fs = require("fs")
const path = require("path")

// MDX 컨텐츠 컴포넌트 파일 경로
const mdxContentPath = path.join(process.cwd(), "components/mdx-content.tsx")

// 파일이 존재하는지 확인
if (fs.existsSync(mdxContentPath)) {
  try {
    // 파일 내용 읽기
    let content = fs.readFileSync(mdxContentPath, "utf8")

    // Pretendard 폰트 참조 확인 및 수정
    if (content.includes("Pretendard") || content.includes("../../../public/fonts/Pretendard")) {
      console.log("Found Pretendard references in mdx-content.tsx")

      // 폰트 참조 수정
      content = content.replace(/['"]Pretendard['"],?\s*/g, "")
      content = content.replace(/\.\.\/\.\.\/\.\.\/public\/fonts\/Pretendard[^'"]+/g, "/fonts/removed.woff")

      // 수정된 내용 저장
      fs.writeFileSync(mdxContentPath, content, "utf8")
      console.log("Fixed mdx-content.tsx")
    } else {
      console.log("No Pretendard references found in mdx-content.tsx")
    }
  } catch (err) {
    console.error("Error processing mdx-content.tsx:", err)
  }
} else {
  console.log("mdx-content.tsx not found")
}
