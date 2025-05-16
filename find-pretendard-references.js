const fs = require("fs")
const path = require("path")

function searchFiles(dir, searchString) {
  const files = fs.readdirSync(dir)

  for (const file of files) {
    const filePath = path.join(dir, file)
    const stat = fs.statSync(filePath)

    if (stat.isDirectory() && file !== "node_modules" && file !== ".next" && file !== ".git") {
      searchFiles(filePath, searchString)
    } else if (stat.isFile()) {
      try {
        const content = fs.readFileSync(filePath, "utf8")
        if (content.includes(searchString)) {
          console.log(`Found in: ${filePath}`)
        }
      } catch (err) {
        // 바이너리 파일 등 읽을 수 없는 파일은 무시
      }
    }
  }
}

// 프로젝트 루트 디렉토리에서 시작
searchFiles(".", "../../../public/fonts/Pretendard")
