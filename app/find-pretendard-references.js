const fs = require("fs")
const path = require("path")
const { promisify } = require("util")
const readdir = promisify(fs.readdir)
const readFile = promisify(fs.readFile)
const stat = promisify(fs.stat)

// 검색할 경로
const searchPath = "./"

// 검색할 패턴
const searchPatterns = [
  "../../../public/fonts/Pretendard-Bold.woff",
  "../../../public/fonts/Pretendard-Regular.woff",
  "Pretendard",
]

// 제외할 디렉토리
const excludeDirs = ["node_modules", ".next", ".git", "public"]

// 검색할 파일 확장자
const fileExtensions = [".js", ".jsx", ".ts", ".tsx", ".css", ".scss", ".html", ".md", ".mdx"]

async function searchFiles(directory) {
  const results = []

  try {
    const files = await readdir(directory)

    for (const file of files) {
      const filePath = path.join(directory, file)
      const fileStat = await stat(filePath)

      // 디렉토리인 경우 재귀적으로 검색 (제외 디렉토리가 아닌 경우)
      if (fileStat.isDirectory()) {
        if (!excludeDirs.includes(file)) {
          const subResults = await searchFiles(filePath)
          results.push(...subResults)
        }
      }
      // 파일인 경우 확장자 확인 후 내용 검색
      else if (fileStat.isFile() && fileExtensions.includes(path.extname(file))) {
        try {
          const content = await readFile(filePath, "utf8")

          for (const pattern of searchPatterns) {
            if (content.includes(pattern)) {
              results.push({
                file: filePath,
                pattern,
                line: content.split("\n").findIndex((line) => line.includes(pattern)) + 1,
              })
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
searchFiles(searchPath)
  .then((results) => {
    console.log("Found references:")
    results.forEach((result) => {
      console.log(`File: ${result.file}, Line: ${result.line}, Pattern: ${result.pattern}`)
    })
    console.log(`Total: ${results.length} references found.`)
  })
  .catch((err) => {
    console.error("Error during search:", err)
  })
