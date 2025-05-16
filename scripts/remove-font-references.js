const fs = require("fs")
const path = require("path")

// 검색할 디렉토리
const rootDir = process.cwd()

// 검색할 패턴
const searchPattern = "../../../public/fonts/Pretendard"

// 제외할 디렉토리
const excludeDirs = ["node_modules", ".next", ".git", "public"]

// 검색할 파일 확장자
const fileExtensions = [".js", ".jsx", ".ts", ".tsx", ".css", ".scss", ".html", ".md", ".mdx"]

// 수정된 파일 수를 추적
let modifiedFiles = 0

// 재귀적으로 디렉토리를 탐색하는 함수
function processDirectory(dir) {
  const files = fs.readdirSync(dir)

  for (const file of files) {
    const filePath = path.join(dir, file)
    const stat = fs.statSync(filePath)

    // 디렉토리인 경우
    if (stat.isDirectory()) {
      // 제외할 디렉토리가 아닌 경우에만 재귀 호출
      if (!excludeDirs.includes(file)) {
        processDirectory(filePath)
      }
    }
    // 파일인 경우
    else if (fileExtensions.includes(path.extname(file))) {
      try {
        const content = fs.readFileSync(filePath, "utf8")

        // 패턴이 포함되어 있는지 확인
        if (content.includes(searchPattern)) {
          // 폰트 참조 제거 또는 수정
          let newContent = content

          // @font-face 블록 제거
          const fontFaceRegex = /@font-face\s*\{[^}]*Pretendard[^}]*\}/g
          if (fontFaceRegex.test(newContent)) {
            newContent = newContent.replace(fontFaceRegex, "")
          }

          // 상대 경로 참조 제거
          newContent = newContent.replace(
            new RegExp(`url\$$['"](${searchPattern}[^'"]*)['"]*\$$`, "g"),
            'url("/fonts/removed.woff")',
          )

          // 파일 저장
          fs.writeFileSync(filePath, newContent, "utf8")
          console.log(`Modified: ${filePath}`)
          modifiedFiles++
        }
      } catch (err) {
        console.error(`Error processing file ${filePath}:`, err)
      }
    }
  }
}

// 처리 시작
console.log(`Processing files to remove "${searchPattern}" references in ${rootDir}...`)
processDirectory(rootDir)

// 결과 출력
console.log(`Modified ${modifiedFiles} files.`)
