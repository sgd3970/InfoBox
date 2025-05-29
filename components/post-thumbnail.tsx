"use client"

import Image from "next/image"
import { cn } from "@/lib/utils"

interface PostThumbnailProps {
  src: string
  alt: string
  width: number
  height: number
  className?: string
}

export function PostThumbnail({
  src,
  alt,
  width,
  height,
  className,
}: PostThumbnailProps) {
  return (
    <div className={cn("relative", className)}>
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className="object-cover"
        priority
      />
    </div>
  )
}
