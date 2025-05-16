const fs = require("fs")
const path = require("path")
const { promisify } = require("util")
const readdir = promisify(fs.readdir)
const readFile = promisify(fs.readFile)
const writeFile = promisify(fs.writeFile)
const stat = promisify(fs.stat)

// 검색할 경로
const searchPath = "./"

// 제거할 패턴
const patterns = [
  "@font-face\\s*{[^}]*Pretendard[^}]*}",
  "font-family:.*Pretendard.*[;,]",
  "fontFamily:.*Pretendard.*[,]",
  "'Pretendard'",
  '"Pretendard"',
]

// 제외할 디렉토리
const excludeDirs = ["node_modules", ".next", ".git", "public"]

// 검색할 파일 확장자
const fileExtensions = [".js", ".jsx", ".ts", ".tsx", ".css", ".scss", ".html", ".md", ".mdx"]

async function removeReferences(directory) {
  const results = []

  try {
    const files = await readdir(directory)

    for (const file of files) {
      const filePath = path.join(directory, file)
      const fileStat = await stat(filePath)

      // 디렉토리인 경우 재귀적으로 검색 (제외 디렉토리가 아닌 경우)
      if (fileStat.isDirectory()) {
        if (!excludeDirs.includes(file)) {
          const subResults = await removeReferences(filePath)
          results.push(...subResults)
        }
      }
      // 파일인 경우 확장자 확인 후 내용 수정
      else if (fileStat.isFile() && fileExtensions.includes(path.extname(file))) {
        try {
          let content = await readFile(filePath, "utf8")
          let modified = false

          for (const pattern of patterns) {
            const regex = new RegExp(pattern, "g")
            if (regex.test(content)) {
              if (pattern.includes("@font-face")) {
                // @font-face 블록 전체 제거
                content = content.replace(regex, "")
              } else if (pattern.includes("font-family") || pattern.includes("fontFamily")) {
                // font-family에서 Pretendard만 제거
                content = content.replace(regex, (match) => {
                  return match.replace(/,?\s*['"]?Pretendard['"]?,?/g, "")
                })
              } else {
                // 다른 Pretendard 참조 제거
                content = content.replace(regex, "")
              }
              modified = true
            }
          }

          if (modified) {
            await writeFile(filePath, content, "utf8")
            results.push({
              file: filePath,
              status: "references removed",
            })
          }
        } catch (err) {
          console.error(`Error processing file ${filePath}:`, err)
        }
      }
    }
  } catch (err) {
    console.error(`Error reading directory ${directory}:`, err)
  }

  return results
}

// 실행
removeReferences(searchPath)
  .then((results) => {
    console.log("Removed references:")
    results.forEach((result) => {
      console.log(`File: ${result.file}, Status: ${result.status}`)
    })
    console.log(`Total: ${results.length} files modified.`)
  })
  .catch((err) => {
    console.error("Error during removal:", err)
  })
