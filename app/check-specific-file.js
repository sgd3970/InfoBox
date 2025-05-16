const fs = require("fs").promises

// 확인할 파일 경로
const filePath = "./app/globals.css" // 예시 경로, 실제 파일 경로로 변경 필요

// 검색할 패턴
const patterns = [
  "../../../public/fonts/Pretendard-Bold.woff",
  "../../../public/fonts/Pretendard-Regular.woff",
  "Pretendard",
]

async function checkSpecificFile() {
  try {
    // 파일 읽기
    const content = await fs.readFile(filePath, "utf8")

    // 패턴 검색
    const results = []

    for (const pattern of patterns) {
      if (content.includes(pattern)) {
        // 패턴이 포함된 라인 찾기
        const lines = content.split("\n")
        const matchedLines = []

        lines.forEach((line, index) => {
          if (line.includes(pattern)) {
            matchedLines.push({
              lineNumber: index + 1,
              content: line.trim(),
            })
          }
        })

        results.push({
          pattern,
          matchedLines,
        })
      }
    }

    // 결과 출력
    if (results.length > 0) {
      console.log(`Found patterns in ${filePath}:`)
      results.forEach((result) => {
        console.log(`Pattern: "${result.pattern}"`)
        result.matchedLines.forEach((line) => {
          console.log(`  Line ${line.lineNumber}: ${line.content}`)
        })
      })
    } else {
      console.log(`No patterns found in ${filePath}.`)
    }
  } catch (err) {
    console.error(`Error reading file ${filePath}:`, err)
  }
}

// 실행
checkSpecificFile()
  .then(() => {
    console.log("Done.")
  })
  .catch((err) => {
    console.error("Error:", err)
  })
