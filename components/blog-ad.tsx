"use client"

import { useEffect } from "react"

declare global {
  interface Window {
    adsbygoogle: any[]
  }
}

export function BlogAd() {
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

  return (
    <div className="my-8 p-4 bg-muted/30 rounded-lg text-center">
      <p className="text-sm text-muted-foreground mb-2">광고</p>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-8478624096187058"
        data-ad-slot="4632464247"
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  )
} 