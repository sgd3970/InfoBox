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

// 결과를 저장할 배열
const results = []

// 재귀적으로 디렉토리를 탐색하는 함수
function searchDirectory(dir) {
  const files = fs.readdirSync(dir)

  for (const file of files) {
    const filePath = path.join(dir, file)
    const stat = fs.statSync(filePath)

    // 디렉토리인 경우
    if (stat.isDirectory()) {
      // 제외할 디렉토리가 아닌 경우에만 재귀 호출
      if (!excludeDirs.includes(file)) {
        searchDirectory(filePath)
      }
    }
    // 파일인 경우
    else if (fileExtensions.includes(path.extname(file))) {
      try {
        const content = fs.readFileSync(filePath, "utf8")

        // 패턴이 포함되어 있는지 확인
        if (content.includes(searchPattern)) {
          const lines = content.split("\n")
          const matchingLines = []

          // 패턴이 포함된 줄 번호 찾기
          lines.forEach((line, index) => {
            if (line.includes(searchPattern)) {
              matchingLines.push({
                lineNumber: index + 1,
                content: line.trim(),
              })
            }
          })

          results.push({
            file: filePath,
            matchingLines,
          })
        }
      } catch (err) {
        console.error(`Error reading file ${filePath}:`, err)
      }
    }
  }
}

// 검색 시작
console.log(`Searching for "${searchPattern}" in ${rootDir}...`)
searchDirectory(rootDir)

// 결과 출력
if (results.length > 0) {
  console.log(`Found ${results.length} files containing "${searchPattern}":`)
  results.forEach((result) => {
    console.log(`\nFile: ${result.file}`)
    result.matchingLines.forEach((line) => {
      console.log(`  Line ${line.lineNumber}: ${line.content}`)
    })
  })
} else {
  console.log(`No files containing "${searchPattern}" found.`)
}
