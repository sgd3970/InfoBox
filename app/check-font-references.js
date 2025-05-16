const fs = require("fs")
const path = require("path")
const { promisify } = require("util")
const readdir = promisify(fs.readdir)
const readFile = promisify(fs.readFile)
const stat = promisify(fs.stat)

// 검색할 경로
const searchPath = "./"

// 제외할 디렉토리
const excludeDirs = ["node_modules", ".next", ".git", "public"]

// 검색할 파일 확장자
const fileExtensions = [".js", ".jsx", ".ts", ".tsx", ".css", ".scss", ".html", ".md", ".mdx"]

// 폰트 관련 패턴
const fontPatterns = ["@font-face", "font-family", "fontFamily", "\\.woff", "\\.woff2", "\\.ttf", "\\.eot", "\\.otf"]

async function checkFontReferences(directory) {
  const results = []

  try {
    const files = await readdir(directory)

    for (const file of files) {
      const filePath = path.join(directory, file)
      const fileStat = await stat(filePath)

      // 디렉토리인 경우 재귀적으로 검색 (제외 디렉토리가 아닌 경우)
      if (fileStat.isDirectory()) {
        if (!excludeDirs.includes(file)) {
          const subResults = await checkFontReferences(filePath)
          results.push(...subResults)
        }
      }
      // 파일인 경우 확장자 확인 후 내용 검색
      else if (fileStat.isFile() && fileExtensions.includes(path.extname(file))) {
        try {
          const content = await readFile(filePath, "utf8")

          for (const pattern of fontPatterns) {
            const regex = new RegExp(pattern, "g")
            if (regex.test(content)) {
              // 매칭된 라인 찾기
              const lines = content.split("\n")
              const matchedLines = []

              lines.forEach((line, index) => {
                if (regex.test(line)) {
                  matchedLines.push({
                    lineNumber: index + 1,
                    content: line.trim(),
                  })

                  // 정규식 재설정 (g 플래그로 인해 lastIndex가 변경됨)
                  regex.lastIndex = 0
                }
              })

              if (matchedLines.length > 0) {
                results.push({
                  file: filePath,
                  pattern,
                  matchedLines,
                })
              }
            }
          }
        } catch (err) {
          console.error(`Error reading file ${filePath}:`, err)
        }
      }
    }
  } catch (err) {
    console.error(`Error reading directory ${directory}:`, err)
  }

  return results
}

// 검색 실행
checkFontReferences(searchPath)
  .then((results) => {
    console.log("Found font references:")
    results.forEach((result) => {
      console.log(`File: ${result.file}, Pattern: ${result.pattern}`)
      result.matchedLines.forEach((line) => {
        console.log(`  Line ${line.lineNumber}: ${line.content}`)
      })
    })
    console.log(`Total: ${results.length} files with font references found.`)
  })
  .catch((err) => {
    console.error("Error during search:", err)
  })
