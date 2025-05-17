// Google Analytics gtag 타입 정의
declare global {
  interface Window {
    gtag: (
      command: "config" | "event" | "consent" | "set",
      targetId: string,
      config?: {
        page_path?: string
        page_title?: string
        page_location?: string
        [key: string]: any
      }
    ) => void
  }
}

"use client"

import { useEffect } from "react"
import { usePathname, useSearchParams } from "next/navigation"
import Script from "next/script"

export function Analytics() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (pathname && window.gtag) {
      // 페이지 변경 시 Google Analytics에 페이지뷰 이벤트 전송
      window.gtag("config", "G-MEASUREMENT_ID", {
        page_path: pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : ""),
      })
    }
  }, [pathname, searchParams])

  return (
    <>
      {/* Google Analytics 스크립트 */}
      <Script strategy="afterInteractive" src={`https://www.googletagmanager.com/gtag/js?id=G-MEASUREMENT_ID`} />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-MEASUREMENT_ID', {
              page_path: window.location.pathname + window.location.search,
            });
          `,
        }}
      />
    </>
  )
}
