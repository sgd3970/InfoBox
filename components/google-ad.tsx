"use client"

interface GoogleAdProps {
  slot: string
  className?: string
}

export default function GoogleAd({ slot, className }: GoogleAdProps) {
  return (
    <div className={className}>
      {/* AdSense 광고 슬롯 */}
      <div className="w-full h-full">
        {/* AdSense 코드를 여기에 삽입 */}
      </div>
    </div>
  )
}
