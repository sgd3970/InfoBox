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
  const [isMobile, setIsMobile] = useState(false)
  const [isAdLoaded, setIsAdLoaded] = useState(false)

  useEffect(() => {
    // 모바일 환경 감지
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)

    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    if (!isMobile && !isAdLoaded && typeof window !== "undefined" && window.adsbygoogle && adRef.current) {
      try {
        window.adsbygoogle.push({})
        setIsAdLoaded(true)
      } catch (e) {
        console.error("AdSense 로딩 실패", e)
      }
    }
  }, [slot, isMobile, isAdLoaded])

  // 모바일 환경에서는 광고를 표시하지 않음
  if (isMobile) {
    return null
  }

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