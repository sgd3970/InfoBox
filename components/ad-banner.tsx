"use client"

import { useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"

declare global {
  interface Window {
    adsbygoogle: any[]
  }
}

interface AdBannerProps {
  position?: "top" | "bottom" | "sidebar"
  adSlot: string
}

export function AdBanner({ position = "top", adSlot }: AdBannerProps) {
  useEffect(() => {
    try {
      // AdSense 스크립트가 이미 로드되어 있는지 확인
      if (!document.querySelector('script[src*="pagead2.googlesyndication.com"]')) {
        const script = document.createElement('script')
        script.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8478624096187058"
        script.async = true
        script.crossOrigin = "anonymous"
        document.head.appendChild(script)
      }

      // 광고 초기화
      ;(window.adsbygoogle = window.adsbygoogle || []).push({})
    } catch (err) {
      console.error('AdSense 로드 중 오류 발생:', err)
    }
  }, [])

  const positionClasses = {
    top: "w-full",
    bottom: "w-full fixed bottom-0 left-0 z-50",
    sidebar: "w-full",
  }

  return (
    <Card className={`overflow-hidden ${positionClasses[position]}`}>
      <CardContent className="p-4">
        <ins
          className="adsbygoogle"
          style={{ display: 'block' }}
          data-ad-client="ca-pub-8478624096187058"
          data-ad-slot={adSlot}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </CardContent>
    </Card>
  )
}
