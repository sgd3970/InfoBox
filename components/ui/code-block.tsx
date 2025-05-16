"use client"

import { useState } from "react"
import { Check, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface CodeBlockProps {
  code: string
  language: string
  filename?: string
  highlightedLines?: number[]
}

export function CodeBlock({ code, language, filename, highlightedLines = [] }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)

  const onCopy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="relative my-6 overflow-hidden rounded-lg border bg-muted">
      {filename && (
        <div className="flex items-center justify-between border-b bg-muted px-4 py-2 text-sm text-muted-foreground">
          <span>{filename}</span>
          <div className="flex items-center gap-1">
            <div className="h-2 w-2 rounded-full bg-red-500" />
            <div className="h-2 w-2 rounded-full bg-yellow-500" />
            <div className="h-2 w-2 rounded-full bg-green-500" />
          </div>
        </div>
      )}
      <div className="relative">
        <pre className="overflow-x-auto p-4 text-sm">
          {code.split("\n").map((line, i) => (
            <div key={i} className={cn("px-4 py-0.5", highlightedLines.includes(i + 1) && "bg-muted-foreground/20")}>
              <span className="mr-4 inline-block w-4 text-right text-muted-foreground">{i + 1}</span>
              {line || "\n"}
            </div>
          ))}
        </pre>
        <Button
          size="icon"
          variant="ghost"
          className="absolute right-4 top-4 h-8 w-8 text-muted-foreground"
          onClick={onCopy}
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          <span className="sr-only">Copy code</span>
        </Button>
      </div>
      {language && (
        <div className="absolute right-0 top-0 rounded-bl-md border-l border-t bg-muted px-2 py-1 text-xs text-muted-foreground">
          {language}
        </div>
      )}
    </div>
  )
}
