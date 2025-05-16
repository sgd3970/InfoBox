"use client"

import { useEffect } from "react"
import { onCLS, onINP, onLCP, onTTFB } from "web-vitals"

export function WebVitals() {
  useEffect(() => {
    // Core Web Vitals 측정 및 보고
    const reportWebVital = ({ name, value, id }: { name: string; value: number; id: string }) => {
      // 실제 환경에서는 분석 서비스로 데이터를 전송합니다.
      // 여기서는 콘솔에 출력합니다.
      console.log(`Web Vital: ${name}`, { value, id })

      // Google Analytics로 전송 예시
      if (window.gtag) {
        window.gtag("event", name, {
          value: Math.round(name === "CLS" ? value * 1000 : value),
          event_category: "Web Vitals",
          event_label: id,
          non_interaction: true,
        })
      }
    }

    // 누적 레이아웃 시프트(CLS) 측정
    onCLS(reportWebVital)

    // 최대 콘텐츠풀 페인트(LCP) 측정
    onLCP(reportWebVital)

    // 상호작용까지의 시간(INP) 측정 - FID 대체
    onINP(reportWebVital)

    // 첫 바이트까지의 시간(TTFB) 측정
    onTTFB(reportWebVital)
  }, [])

  return null
}
