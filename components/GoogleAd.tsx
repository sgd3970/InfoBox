"use client"

import { useEffect, useRef, useState } from "react"

declare global {
  interface Window {
    adsbygoogle: any[]
  }
}

interface GoogleAdProps {
  slot: string // 광고 슬롯 ID
  style?: React.CSSProperties // 스타일 커스터마이징 가능
  className?: string // Tailwind CSS 클래스 추가
}

export const GoogleAd = ({ slot, style, className }: GoogleAdProps) => {
  const adRef = useRef<HTMLDivElement>(null)
  const [isAdLoaded, setIsAdLoaded] = useState(false)

  useEffect(() => {
    if (!isAdLoaded && typeof window !== "undefined" && window.adsbygoogle && adRef.current) {
      try {
        window.adsbygoogle.push({})
        setIsAdLoaded(true)
      } catch (e) {
        console.error("AdSense 로딩 실패", e)
      }
    }
  }, [slot, isAdLoaded])

  return (
    <div 
      style={{ 
        textAlign: "center", 
        minHeight: 100,
        margin: "1rem 0",
        ...style 
      }} 
      ref={adRef} 
      className={className}
    >
      <ins
        className="adsbygoogle"
        style={{ 
          display: "block",
          width: "100%",
          height: "100%"
        }}
        data-ad-client="ca-pub-8478624096187058"
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  )
} 