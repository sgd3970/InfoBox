const fs = require("fs").promises
const path = require("path")

// 생성할 CSS 파일 경로
const cssFilePath = "./app/fonts.css"

// CSS 내용
const cssContent = `/* 이 파일은 프로젝트에서 사용하는 폰트를 정의합니다 */

/* Pretendard 폰트 정의 */
@font-face {
  font-family: 'Pretendard';
  src: url('/fonts/Pretendard-Regular.woff') format('woff');
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: 'Pretendard';
  src: url('/fonts/Pretendard-Bold.woff') format('woff');
  font-weight: 700;
  font-style: normal;
  font-display: swap;
}

/* Google Fonts에서 Noto Sans KR 폰트 사용 */
@import url("https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700&display=swap");
`

async function createFontCss() {
  try {
    // 디렉토리 확인 및 생성
    const dir = path.dirname(cssFilePath)
    try {
      await fs.access(dir)
    } catch (err) {
      // 디렉토리가 없으면 생성
      await fs.mkdir(dir, { recursive: true })
    }

    // CSS 파일 생성
    await fs.writeFile(cssFilePath, cssContent, "utf8")
    console.log(`Font CSS file created at ${cssFilePath}`)
  } catch (err) {
    console.error("Error creating font CSS file:", err)
  }
}

// 실행
createFontCss()
  .then(() => {
    console.log("Done.")
  })
  .catch((err) => {
    console.error("Error:", err)
  })
