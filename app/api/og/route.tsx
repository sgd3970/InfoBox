import { ImageResponse } from "next/og"
import type { NextRequest } from "next/server"

export const runtime = "edge"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const title = searchParams.get("title") || "블로그 포스트"
  const category = searchParams.get("category") || "카테고리"

  // CDN에서 폰트 로드
  const pretendardBold = await fetch(
    "https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/woff/Pretendard-Bold.woff",
  ).then((res) => res.arrayBuffer())

  const pretendardRegular = await fetch(
    "https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/woff/Pretendard-Regular.woff",
  ).then((res) => res.arrayBuffer())

  return new ImageResponse(
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "white",
        backgroundImage: "linear-gradient(to bottom right, #f0f9ff, #ffffff)",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          border: "2px solid #e5e7eb",
          borderRadius: "15px",
          padding: "40px",
          backgroundColor: "white",
          width: "90%",
          height: "80%",
          boxShadow: "0 8px 16px rgba(0, 0, 0, 0.1)",
        }}
      >
        <div
          style={{
            display: "flex",
            backgroundColor: "#f3f4f6",
            borderRadius: "4px",
            padding: "8px 16px",
            marginBottom: "20px",
          }}
        >
          <p
            style={{
              fontSize: 24,
              fontWeight: "normal",
              color: "#4b5563",
            }}
          >
            {category}
          </p>
        </div>
        <h1
          style={{
            fontSize: 64,
            fontWeight: "bold",
            color: "#111827",
            textAlign: "center",
            marginBottom: "20px",
            lineHeight: 1.2,
          }}
        >
          {title}
        </h1>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginTop: "20px",
          }}
        >
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "24px",
              backgroundColor: "#e5e7eb",
              marginRight: "12px",
            }}
          />
          <div>
            <p
              style={{
                fontSize: 24,
                fontWeight: "bold",
                color: "#111827",
              }}
            >
              InfoBox
            </p>
            <p
              style={{
                fontSize: 18,
                color: "#6b7280",
              }}
            >
              {new Date().toLocaleDateString("ko-KR")}
            </p>
          </div>
        </div>
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: "Pretendard",
          data: pretendardBold,
          style: "normal",
          weight: 700,
        },
        {
          name: "Pretendard",
          data: pretendardRegular,
          style: "normal",
          weight: 400,
        },
      ],
    },
  )
}
