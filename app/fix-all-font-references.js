const fs = require("fs")
const path = require("path")
const { promisify } = require("util")
const readdir = promisify(fs.readdir)
const readFile = promisify(fs.readFile)
const writeFile = promisify(fs.writeFile)
const stat = promisify(fs.stat)

// 검색할 경로
const searchPath = "./"

// 제외할 디렉토리
const excludeDirs = ["node_modules", ".next", ".git", "public"]

// 검색할 파일 확장자
const fileExtensions = [".js", ".jsx", ".ts", ".tsx", ".css", ".scss", ".html", ".md", ".mdx"]

// 수정할 패턴과 대체할 내용
const replacements = [
  {
    pattern: "../../../public/fonts/Pretendard-Bold.woff",
    replacement: "/fonts/Pretendard-Bold.woff",
  },
  {
    pattern: "../../../public/fonts/Pretendard-Regular.woff",
    replacement: "/fonts/Pretendard-Regular.woff",
  },
  {
    pattern: "../../public/fonts/Pretendard-Bold.woff",
    replacement: "/fonts/Pretendard-Bold.woff",
  },
  {
    pattern: "../../public/fonts/Pretendard-Regular.woff",
    replacement: "/fonts/Pretendard-Regular.woff",
  },
  {
    pattern: "../public/fonts/Pretendard-Bold.woff",
    replacement: "/fonts/Pretendard-Bold.woff",
  },
  {
    pattern: "../public/fonts/Pretendard-Regular.woff",
    replacement: "/fonts/Pretendard-Regular.woff",
  },
]

async function fixAllFontReferences(directory) {
  const results = []

  try {
    const files = await readdir(directory)

    for (const file of files) {
      const filePath = path.join(directory, file)
      const fileStat = await stat(filePath)

      // 디렉토리인 경우 재귀적으로 검색 (제외 디렉토리가 아닌 경우)
      if (fileStat.isDirectory()) {
        if (!excludeDirs.includes(file)) {
          const subResults = await fixAllFontReferences(filePath)
          results.push(...subResults)
        }
      }
      // 파일인 경우 확장자 확인 후 내용 수정
      else if (fileStat.isFile() && fileExtensions.includes(path.extname(file))) {
        try {
          let content = await readFile(filePath, "utf8")
          let modified = false

          for (const { pattern, replacement } of replacements) {
            if (content.includes(pattern)) {
              content = content.replace(new RegExp(pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"), replacement)
              modified = true
            }
          }

          if (modified) {
            await writeFile(filePath, content, "utf8")
            results.push({
              file: filePath,
              status: "fixed",
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

// 수정 실행
fixAllFontReferences(searchPath)
  .then((results) => {
    console.log("Fixed font references:")
    results.forEach((result) => {
      console.log(`File: ${result.file}, Status: ${result.status}`)
    })
    console.log(`Total: ${results.length} files fixed.`)
  })
  .catch((err) => {
    console.error("Error during fix:", err)
  })
