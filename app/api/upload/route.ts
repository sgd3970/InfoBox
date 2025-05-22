import { NextResponse } from "next/server"
import { writeFile, mkdir, readdir } from "fs/promises"
import path from "path"
// import { v4 as uuidv4 } from 'uuid'; // uuid 더 이상 사용 안함

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const files = formData.getAll("file") as File[] // 여러 파일 가져오기

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "파일이 제공되지 않았습니다." }, { status: 400 })
    }

    const uploadDir = path.join(process.cwd(), "public", "uploads")

    // 디렉토리가 없으면 생성
    await mkdir(uploadDir, { recursive: true }).catch(console.error);

    // 기존 파일 목록을 읽고 마지막 숫자 확인
    const existingFiles = await readdir(uploadDir);
    let lastNumber = 0;
    const numberPattern = /^(\d+)\..+$/; // 숫자.확장자 패턴

    for (const fileName of existingFiles) {
      const match = fileName.match(numberPattern);
      if (match && match[1]) {
        const fileNumber = parseInt(match[1], 10);
        if (!isNaN(fileNumber) && fileNumber > lastNumber) {
          lastNumber = fileNumber;
        }
      }
    }

    let currentNumber = lastNumber + 1;

    const uploadedFilesInfo = await Promise.all(files.map(async (file) => {
      const buffer = Buffer.from(await file.arrayBuffer())
      const fileExtension = path.extname(file.name);
      const uniqueFilename = `${currentNumber}${fileExtension}`; // 순차적인 숫자 파일 이름 생성
      const filePath = path.join(uploadDir, uniqueFilename)

      await writeFile(filePath, buffer)

      const fileUrl = `/uploads/${uniqueFilename}`
      currentNumber++; // 다음 파일을 위해 숫자 증가
      return { url: fileUrl, filename: file.name, uniqueFilename };
    }));

    return NextResponse.json({ urls: uploadedFilesInfo.map(info => info.url), files: uploadedFilesInfo }, { status: 200 })
  } catch (error) {
    console.error("파일 업로드 오류:", error)
    return NextResponse.json({ error: "파일 업로드 중 오류가 발생했습니다." }, { status: 500 })
  }
} 