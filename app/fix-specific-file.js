const fs = require("fs").promises

// 수정할 파일 경로
const filePath = "./app/globals.css" // 예시 경로, 실제 파일 경로로 변경 필요

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
]

async function fixSpecificFile() {
  try {
    // 파일 읽기
    let content = await fs.readFile(filePath, "utf8")
    let modified = false

    // 패턴 찾아서 대체
    for (const { pattern, replacement } of replacements) {
      if (content.includes(pattern)) {
        content = content.replace(new RegExp(pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"), replacement)
        modified = true
        console.log(`Replaced "${pattern}" with "${replacement}"`)
      }
    }

    // 수정된 경우에만 파일 쓰기
    if (modified) {
      await fs.writeFile(filePath, content, "utf8")
      console.log(`File ${filePath} has been updated.`)
    } else {
      console.log(`No patterns found in ${filePath}.`)
    }
  } catch (err) {
    console.error(`Error processing file ${filePath}:`, err)
  }
}

// 실행
fixSpecificFile()
  .then(() => {
    console.log("Done.")
  })
  .catch((err) => {
    console.error("Error:", err)
  })
