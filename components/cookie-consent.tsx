"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // 쿠키 동의 여부 확인
    const hasConsent = localStorage.getItem("cookieConsent")
    if (!hasConsent) {
      setIsVisible(true)
    }
  }, [])

  const acceptAll = () => {
    localStorage.setItem("cookieConsent", "all")
    setIsVisible(false)
  }

  const acceptNecessary = () => {
    localStorage.setItem("cookieConsent", "necessary")
    setIsVisible(false)
  }

  const close = () => {
    setIsVisible(false)
  }

  if (!isVisible) {
    return null
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-background border-t shadow-lg">
      <div className="container flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold mb-2">🍪 쿠키 사용에 대한 안내</h3>
          <p className="text-sm text-muted-foreground">
            이 웹사이트는 사용자 경험 향상을 위해 쿠키를 사용합니다. 필수 쿠키는 웹사이트의 기본 기능을 위해 항상
            활성화됩니다. 분석 및 마케팅 쿠키는 선택적으로 사용됩니다.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={acceptNecessary}>
            필수 쿠키만 허용
          </Button>
          <Button size="sm" onClick={acceptAll}>
            모든 쿠키 허용
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={close}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
