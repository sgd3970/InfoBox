"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface AdBannerProps {
  position?: "top" | "bottom" | "sidebar"
  type?: "image" | "text"
  imageUrl?: string
  title?: string
  description?: string
  ctaText?: string
  ctaUrl?: string
  dismissible?: boolean
}

export function AdBanner({
  position = "top",
  type = "text",
  imageUrl,
  title = "특별 프로모션",
  description = "지금 가입하고 프리미엄 콘텐츠를 무료로 이용해보세요!",
  ctaText = "자세히 보기",
  ctaUrl = "#",
  dismissible = true,
}: AdBannerProps) {
  const [isVisible, setIsVisible] = useState(true)
  const [hasInteracted, setHasInteracted] = useState(false)

  useEffect(() => {
    // 이전에 배너를 닫았는지 확인
    const bannerDismissed = localStorage.getItem("ad_banner_dismissed")
    if (bannerDismissed === "true") {
      setIsVisible(false)
    }

    // 배너 노출 추적
    if (isVisible) {
      console.log("Ad banner impression")
      // 실제 구현에서는 아래와 같이 분석 서비스로 전송
      // window.gtag?.('event', 'ad_impression', {
      //   event_category: 'advertising',
      //   event_label: title,
      // });
    }
  }, [isVisible, title])

  const handleDismiss = () => {
    setIsVisible(false)
    localStorage.setItem("ad_banner_dismissed", "true")

    console.log("Ad banner dismissed")
    // 실제 구현에서는 아래와 같이 분석 서비스로 전송
    // window.gtag?.('event', 'ad_dismissed', {
    //   event_category: 'advertising',
    //   event_label: title,
    // });
  }

  const handleClick = () => {
    setHasInteracted(true)

    console.log("Ad banner clicked")
    // 실제 구현에서는 아래와 같이 분석 서비스로 전송
    // window.gtag?.('event', 'ad_click', {
    //   event_category: 'advertising',
    //   event_label: title,
    // });
  }

  if (!isVisible) return null

  const positionClasses = {
    top: "w-full",
    bottom: "w-full fixed bottom-0 left-0 z-50",
    sidebar: "w-full",
  }

  return (
    <Card className={`overflow-hidden ${positionClasses[position]}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          {type === "image" && imageUrl ? (
            <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center">
              <img src={imageUrl || "/placeholder.svg"} alt={title} className="h-16 w-auto rounded object-cover" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold">{title}</h3>
                <p className="text-sm text-muted-foreground">{description}</p>
              </div>
              <Button asChild variant="default" size="sm" onClick={handleClick}>
                <a href={ctaUrl} target="_blank" rel="noopener noreferrer">
                  {ctaText}
                </a>
              </Button>
            </div>
          ) : (
            <div className="flex flex-1 flex-col items-start gap-2 sm:flex-row sm:items-center">
              <div className="flex-1">
                <h3 className="text-lg font-semibold">{title}</h3>
                <p className="text-sm text-muted-foreground">{description}</p>
              </div>
              <Button asChild variant="default" size="sm" onClick={handleClick}>
                <a href={ctaUrl} target="_blank" rel="noopener noreferrer">
                  {ctaText}
                </a>
              </Button>
            </div>
          )}
          {dismissible && (
            <Button variant="ghost" size="icon" className="ml-2 h-8 w-8 shrink-0" onClick={handleDismiss}>
              <X className="h-4 w-4" />
              <span className="sr-only">배너 닫기</span>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
