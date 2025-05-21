"use client"

import { GoogleAd } from "@/components/GoogleAd"
import { Card, CardContent } from "@/components/ui/card"

declare global {
  interface Window {
    adsbygoogle: any[]
  }
}

export function SidebarAds() {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <GoogleAd slot="5110735140" />
      </CardContent>
    </Card>
  )
}
