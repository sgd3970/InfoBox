"use client"

import { useEffect } from "react"

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/service-worker.js")
          .then((registration) => {
            console.log("서비스 워커가 성공적으로 등록되었습니다:", registration.scope)
          })
          .catch((error) => {
            console.error("서비스 워커 등록 중 오류 발생:", error)
          })
      })
    }
  }, [])

  return null
}
