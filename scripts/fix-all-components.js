const fs = require("fs")
const path = require("path")

// 검색할 디렉토리
const componentsDir = path.join(process.cwd(), "components")

// 제외할 파일
const excludeFiles = []

// 수정된 파일 수를 추적
let modifiedFiles = 0

// 재귀적으로 디렉토리를 탐색하는 함수
function processDirectory(dir) {
  if (!fs.existsSync(dir)) {
    console.log(`Directory does not exist: ${dir}`)
    return
  }

  const files = fs.readdirSync(dir)

  for (const file of files) {
    const filePath = path.join(dir, file)
    const stat = fs.statSync(filePath)

    // 디렉토리인 경우
    if (stat.isDirectory()) {
      processDirectory(filePath)
    }
    // 파일인 경우
    else if (path.extname(file) === ".tsx" || path.extname(file) === ".jsx") {
      // 제외할 파일이 아닌 경우에만 처리
      if (!excludeFiles.includes(file)) {
        try {
          const content = fs.readFileSync(filePath, "utf8")

          // Pretendard 폰트 참조 확인
          if (content.includes("Pretendard") || content.includes("../../../public/fonts/Pretendard")) {
            console.log(`Found Pretendard references in ${filePath}`)

            // 폰트 참조 수정
            let newContent = content
            newContent = newContent.replace(/['"]Pretendard['"],?\s*/g, "")
            newContent = newContent.replace(/\.\.\/\.\.\/\.\.\/public\/fonts\/Pretendard[^'"]+/g, "/fonts/removed.woff")

            // 수정된 내용 저장
            fs.writeFileSync(filePath, newContent, "utf8")
            console.log(`Fixed ${filePath}`)
            modifiedFiles++
          }
        } catch (err) {
          console.error(`Error processing file ${filePath}:`, err)
        }
      }
    }
  }
}

// 처리 시작
console.log(`Processing components to remove Pretendard references...`)
processDirectory(componentsDir)

// 결과 출력
console.log(`Modified ${modifiedFiles} files.`)
