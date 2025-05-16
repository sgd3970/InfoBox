"use client"

import { useEffect } from "react"

export function ErrorMonitoring() {
  useEffect(() => {
    // 전역 에러 핸들러 설정
    const handleError = (event: ErrorEvent) => {
      console.error("Captured error:", event.error)

      // 에러 정보 수집
      const errorInfo = {
        message: event.error?.message || "Unknown error",
        stack: event.error?.stack,
        source: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
      }

      // 에러 로깅 서비스로 전송 (예: Sentry)
      // 실제 구현에서는 아래 주석을 해제하고 API 엔드포인트로 전송
      // fetch('/api/error-logging', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(errorInfo),
      // }).catch(console.error);
    }

    // 프로미스 에러 핸들러 설정
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error("Unhandled promise rejection:", event.reason)

      // 에러 정보 수집
      const errorInfo = {
        message: event.reason?.message || "Unhandled promise rejection",
        stack: event.reason?.stack,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
      }

      // 에러 로깅 서비스로 전송
      // 실제 구현에서는 아래 주석을 해제하고 API 엔드포인트로 전송
      // fetch('/api/error-logging', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(errorInfo),
      // }).catch(console.error);
    }

    // 이벤트 리스너 등록
    window.addEventListener("error", handleError)
    window.addEventListener("unhandledrejection", handleUnhandledRejection)

    // 컴포넌트 언마운트 시 이벤트 리스너 제거
    return () => {
      window.removeEventListener("error", handleError)
      window.removeEventListener("unhandledrejection", handleUnhandledRejection)
    }
  }, [])

  return null
}
