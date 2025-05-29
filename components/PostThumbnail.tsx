import Image from "next/image";
import React from "react";

function isBase64Image(src?: string | null) {
  return !!src && src.startsWith("data:image");
}

interface PostThumbnailProps {
  src?: string | null;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  style?: React.CSSProperties;
}

export function PostThumbnail({ src, alt, width = 400, height = 200, className, priority, style }: PostThumbnailProps) {
  if (isBase64Image(src)) {
    return <img src={src!} alt={alt} width={width} height={height} className={className} style={style} />;
  }
  return (
    <Image
      src={src || "/placeholder.svg"}
      alt={alt}
      width={width}
      height={height}
      className={className}
      priority={priority}
      style={style}
    />
  );
} 