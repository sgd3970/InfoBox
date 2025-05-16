"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface Ad {
  id: string
  title: string
  description: string
  imageUrl?: string
  ctaText: string
  ctaUrl: string
}

interface SidebarAdsProps {
  ads?: Ad[]
  refreshInterval?: number
}

export function SidebarAds({
  ads = [
    {
      id: "ad1",
      title: "프리미엄 멤버십",
      description: "독점 콘텐츠와 특별 혜택을 누려보세요.",
      imageUrl: "/placeholder.svg?height=100&width=200",
      ctaText: "가입하기",
      ctaUrl: "#",
    },
    {
      id: "ad2",
      title: "새로운 강좌 출시",
      description: "최신 기술 트렌드를 배워보세요.",
      imageUrl: "/placeholder.svg?height=100&width=200",
      ctaText: "자세히 보기",
      ctaUrl: "#",
    },
  ],
  refreshInterval = 10000,
}: SidebarAdsProps) {
  const [currentAdIndex, setCurrentAdIndex] = useState(0)
  const [impressions, setImpressions] = useState<Record<string, boolean>>({})

  useEffect(() => {
    if (ads.length <= 1) return

    // 광고 순환 타이머 설정
    const timer = setInterval(() => {
      setCurrentAdIndex((prevIndex) => (prevIndex + 1) % ads.length)
    }, refreshInterval)

    return () => clearInterval(timer)
  }, [ads.length, refreshInterval])

  useEffect(() => {
    if (ads.length === 0) return

    const currentAd = ads[currentAdIndex]

    // 광고 노출 추적 (중복 방지)
    if (!impressions[currentAd.id]) {
      console.log(`Sidebar ad impression: ${currentAd.title}`)
      // 실제 구현에서는 아래와 같이 분석 서비스로 전송
      // window.gtag?.('event', 'sidebar_ad_impression', {
      //   event_category: 'advertising',
      //   event_label: currentAd.title,
      //   ad_id: currentAd.id,
      // });

      setImpressions((prev) => ({ ...prev, [currentAd.id]: true }))
    }
  }, [currentAdIndex, ads, impressions])

  const handleClick = (ad: Ad) => {
    console.log(`Sidebar ad click: ${ad.title}`)
    // 실제 구현에서는 아래와 같이 분석 서비스로 전송
    // window.gtag?.('event', 'sidebar_ad_click', {
    //   event_category: 'advertising',
    //   event_label: ad.title,
    //   ad_id: ad.id,
    // });
  }

  if (ads.length === 0) return null

  const currentAd = ads[currentAdIndex]

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        {currentAd.imageUrl && (
          <div className="mb-3 overflow-hidden rounded">
            <img
              src={currentAd.imageUrl || "/placeholder.svg"}
              alt={currentAd.title}
              className="h-auto w-full object-cover transition-transform hover:scale-105"
            />
          </div>
        )}
        <div className="space-y-1">
          <h3 className="font-semibold">{currentAd.title}</h3>
          <p className="text-sm text-muted-foreground">{currentAd.description}</p>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button asChild variant="default" size="sm" className="w-full" onClick={() => handleClick(currentAd)}>
          <a href={currentAd.ctaUrl} target="_blank" rel="noopener noreferrer">
            {currentAd.ctaText}
          </a>
        </Button>
      </CardFooter>
    </Card>
  )
}
