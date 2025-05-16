import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    name: "InfoBox",
    short_name: "InfoBox",
    description: "MDX 기반의 블로그 플랫폼",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#000000",
    icons: [
      {
        src: "/icon-192x192.png",
        sizes: "192x192",
        type: "image/png"
      },
      {
        src: "/icon-512x512.png",
        sizes: "512x512",
        type: "image/png"
      }
    ]
  }, {
    headers: {
      'Content-Type': 'application/manifest+json',
    },
  });
} 