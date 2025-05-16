const fs = require("fs")
const path = require("path")

// 검색할 디렉토리
const rootDir = process.cwd()

// 제외할 디렉토리
const excludeDirs = ["node_modules", ".next", ".git", "public"]

// CSS 파일 확장자
const cssExtensions = [".css", ".scss"]

// 결과를 저장할 배열
const cssFiles = []

// 재귀적으로 디렉토리를 탐색하는 함수
function findCssFiles(dir) {
  const files = fs.readdirSync(dir)

  for (const file of files) {
    const filePath = path.join(dir, file)
    const stat = fs.statSync(filePath)

    // 디렉토리인 경우
    if (stat.isDirectory()) {
      // 제외할 디렉토리가 아닌 경우에만 재귀 호출
      if (!excludeDirs.includes(file)) {
        findCssFiles(filePath)
      }
    }
    // CSS 파일인 경우
    else if (cssExtensions.includes(path.extname(file))) {
      try {
        const content = fs.readFileSync(filePath, "utf8")
        cssFiles.push({
          file: filePath,
          content,
        })
      } catch (err) {
        console.error(`Error reading file ${filePath}:`, err)
      }
    }
  }
}

// 검색 시작
console.log(`Finding all CSS files in ${rootDir}...`)
findCssFiles(rootDir)

// 결과 출력
console.log(`Found ${cssFiles.length} CSS files:`)
cssFiles.forEach((file) => {
  console.log(`\nFile: ${file.file}`)

  // @font-face 규칙 찾기
  const fontFaceRegex = /@font-face\s*\{[^}]*\}/g
  const fontFaces = file.content.match(fontFaceRegex)

  if (fontFaces) {
    console.log(`  Contains ${fontFaces.length} @font-face rules:`)
    fontFaces.forEach((rule) => {
      console.log(`    ${rule.replace(/\s+/g, " ").substring(0, 100)}...`)
    })
  } else {
    console.log("  No @font-face rules found.")
  }

  // 폰트 관련 import 찾기
  const importRegex = /@import\s+url$$[^)]*$$/g
  const imports = file.content.match(importRegex)

  if (imports) {
    console.log(`  Contains ${imports.length} @import rules:`)
    imports.forEach((rule) => {
      console.log(`    ${rule}`)
    })
  } else {
    console.log("  No @import rules found.")
  }
})
