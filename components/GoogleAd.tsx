"use client"

import { useEffect, useRef } from "react"

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

  useEffect(() => {
    try {
      // window.adsbygoogle가 로드되었는지 확인 후 push
      if (typeof window !== "undefined" && window.adsbygoogle && adRef.current) {
        // 기존 광고 초기화 코드는 layout.tsx로 옮겼으므로, 여기서는 push만 호출
        // (window.adsbygoogle = window.adsbygoogle || []).push({}); // 이 부분은 layout.tsx에서 처리
        window.adsbygoogle.push({});
      }
    } catch (e) {
      console.error("AdSense 로딩 실패", e)
    }
  }, [slot]) // slot이 변경될 때마다 useEffect 재실행

  return (
    <div style={{ textAlign: "center", minHeight: 100, ...style }} ref={adRef} className={className}>
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client="ca-pub-8478624096187058"
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  )
} 