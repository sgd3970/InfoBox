const fs = require("fs")
const path = require("path")
const glob = require("glob")

// 프로젝트 루트 디렉토리
const rootDir = process.cwd()

// 모든 CSS, SCSS, JS, TS, TSX, JSX 파일 찾기
const files = glob.sync("**/*.{css,scss,js,ts,tsx,jsx}", {
  ignore: ["node_modules/**", ".next/**", ".git/**", "public/**"],
  cwd: rootDir,
})

let modifiedFiles = 0

// 각 파일에서 Pretendard 폰트 참조 찾기 및 수정
files.forEach((file) => {
  const filePath = path.join(rootDir, file)

  try {
    let content = fs.readFileSync(filePath, "utf8")
    const originalContent = content

    // Pretendard 폰트 참조 확인
    if (content.includes("Pretendard") || content.includes("../../../public/fonts/Pretendard")) {
      console.log(`Found Pretendard references in: ${file}`)

      // @font-face 규칙 제거
      content = content.replace(/@font-face\s*\{[^}]*Pretendard[^}]*\}/g, "")

      // 폰트 패밀리에서 Pretendard 제거
      content = content.replace(/(['"])Pretendard(['"])\s*,?/g, "")
      content = content.replace(/,\s*(['"])Pretendard(['"])/g, "")

      // 상대 경로 참조 제거
      content = content.replace(
        /url$$['"]?\.\.\/\.\.\/\.\.\/public\/fonts\/Pretendard[^'")\s]+['"]?$$/g,
        'url("/fonts/removed.woff")',
      )

      // 변경된 내용이 있으면 파일 저장
      if (content !== originalContent) {
        fs.writeFileSync(filePath, content, "utf8")
        console.log(`Modified: ${file}`)
        modifiedFiles++
      }
    }
  } catch (err) {
    console.error(`Error processing file ${file}:`, err)
  }
})

console.log(`Modified ${modifiedFiles} files.`)
