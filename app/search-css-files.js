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

// CSS 파일 확장자
const cssExtensions = [".css", ".scss", ".sass", ".less"]

async function searchCssFiles(directory) {
  const results = []

  try {
    const files = await readdir(directory)

    for (const file of files) {
      const filePath = path.join(directory, file)
      const fileStat = await stat(filePath)

      // 디렉토리인 경우 재귀적으로 검색 (제외 디렉토리가 아닌 경우)
      if (fileStat.isDirectory()) {
        if (!excludeDirs.includes(file)) {
          const subResults = await searchCssFiles(filePath)
          results.push(...subResults)
        }
      }
      // CSS 파일인 경우 목록에 추가
      else if (fileStat.isFile() && cssExtensions.includes(path.extname(file))) {
        results.push({
          file: filePath,
          size: fileStat.size,
          modified: fileStat.mtime,
        })
      }
    }
  } catch (err) {
    console.error(`Error reading directory ${directory}:`, err)
  }

  return results
}

// 검색 실행
searchCssFiles(searchPath)
  .then((results) => {
    console.log("Found CSS files:")
    results.forEach((result) => {
      console.log(`File: ${result.file}, Size: ${result.size} bytes, Modified: ${result.modified}`)
    })
    console.log(`Total: ${results.length} CSS files found.`)
  })
  .catch((err) => {
    console.error("Error during search:", err)
  })
