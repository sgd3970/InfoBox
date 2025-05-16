"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

interface TocItem {
  id: string
  text: string
  level: number
}

interface TocProps {
  headings: TocItem[]
}

export function TableOfContents({ headings }: TocProps) {
  const [activeId, setActiveId] = useState<string>("")

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        })
      },
      { rootMargin: "0% 0% -80% 0%" },
    )

    headings.forEach((heading) => {
      const element = document.getElementById(heading.id)
      if (element) {
        observer.observe(element)
      }
    })

    return () => {
      headings.forEach((heading) => {
        const element = document.getElementById(heading.id)
        if (element) {
          observer.unobserve(element)
        }
      })
    }
  }, [headings])

  if (headings.length === 0) {
    return null
  }

  return (
    <div className="hidden lg:block">
      <div className="sticky top-20">
        <h3 className="mb-4 text-lg font-semibold">목차</h3>
        <ul className="space-y-2 text-sm">
          {headings.map((heading) => (
            <li
              key={heading.id}
              className={cn(
                "transition-colors hover:text-foreground",
                activeId === heading.id ? "text-foreground font-medium" : "text-muted-foreground",
                heading.level === 2 ? "pl-0" : "pl-4",
              )}
            >
              <a
                href={`#${heading.id}`}
                className="inline-block"
                onClick={(e) => {
                  e.preventDefault()
                  document.querySelector(`#${heading.id}`)?.scrollIntoView({
                    behavior: "smooth",
                  })
                }}
              >
                {heading.text}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
