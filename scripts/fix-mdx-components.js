const fs = require("fs")
const path = require("path")

// MDX 컴포넌트 파일 경로
const mdxComponentsPath = path.join(process.cwd(), "mdx-components.tsx")

// 파일이 존재하는지 확인
if (fs.existsSync(mdxComponentsPath)) {
  try {
    // 파일 내용 읽기
    let content = fs.readFileSync(mdxComponentsPath, "utf8")

    // Pretendard 폰트 참조 확인 및 수정
    if (content.includes("Pretendard") || content.includes("../../../public/fonts/Pretendard")) {
      console.log("Found Pretendard references in mdx-components.tsx")

      // 폰트 참조 수정
      content = content.replace(/['"]Pretendard['"],?\s*/g, "")
      content = content.replace(/\.\.\/\.\.\/\.\.\/public\/fonts\/Pretendard[^'"]+/g, "/fonts/removed.woff")

      // 수정된 내용 저장
      fs.writeFileSync(mdxComponentsPath, content, "utf8")
      console.log("Fixed mdx-components.tsx")
    } else {
      console.log("No Pretendard references found in mdx-components.tsx")
    }
  } catch (err) {
    console.error("Error processing mdx-components.tsx:", err)
  }
} else {
  console.log("mdx-components.tsx not found")
}
