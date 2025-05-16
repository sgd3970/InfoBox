"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"

export function PWARegister() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showInstallPrompt, setShowInstallPrompt] = useState(false)

  useEffect(() => {
    // beforeinstallprompt 이벤트 리스너 등록
    const handleBeforeInstallPrompt = (e: Event) => {
      // 기본 동작 방지
      e.preventDefault()
      // 이벤트 저장
      setDeferredPrompt(e)
      // 설치 프롬프트 표시
      setShowInstallPrompt(true)
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)

    // 이미 설치되었는지 확인
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setShowInstallPrompt(false)
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstallClick = () => {
    if (!deferredPrompt) return

    // 설치 프롬프트 표시
    deferredPrompt.prompt()

    // 사용자 응답 확인
    deferredPrompt.userChoice.then((choiceResult: { outcome: string }) => {
      if (choiceResult.outcome === "accepted") {
        console.log("사용자가 PWA 설치를 수락했습니다.")
      } else {
        console.log("사용자가 PWA 설치를 거부했습니다.")
      }
      // 프롬프트 초기화
      setDeferredPrompt(null)
      setShowInstallPrompt(false)
    })
  }

  if (!showInstallPrompt) {
    return null
  }

  return (
    <div className="fixed bottom-20 right-4 z-50">
      <Button onClick={handleInstallClick} className="shadow-lg flex items-center gap-2">
        <Download className="h-4 w-4" />앱 설치하기
      </Button>
    </div>
  )
}
