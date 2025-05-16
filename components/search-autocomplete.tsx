"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"

export function SearchAutocomplete() {
  const [query, setQuery] = useState("")
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)

  // 검색어 변경 시 자동 완성 제안 가져오기
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (query.trim().length < 2) {
        setSuggestions([])
        return
      }

      setLoading(true)

      try {
        // 모의 데이터로 대체 (실제로는 API 호출)
        // const res = await fetch(`/api/search/suggestions?q=${encodeURIComponent(query)}`)
        // const data = await res.json()
        // setSuggestions(data.suggestions)

        // 모의 데이터
        const mockSuggestions = ["Next.js", "Next.js와 MDX", "React", "TypeScript", "Tailwind CSS"].filter((s) =>
          s.toLowerCase().includes(query.toLowerCase()),
        )

        setSuggestions(mockSuggestions)
      } catch (error) {
        console.error("자동 완성 제안 가져오기 오류:", error)
      } finally {
        setLoading(false)
      }
    }

    const timer = setTimeout(fetchSuggestions, 300)

    return () => clearTimeout(timer)
  }, [query])

  // 검색 실행
  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault()

    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`)
      setShowSuggestions(false)
    }
  }

  // 제안 클릭 처리
  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion)
    router.push(`/search?q=${encodeURIComponent(suggestion)}`)
    setShowSuggestions(false)
  }

  // 외부 클릭 시 제안 닫기
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div className="relative w-full">
      <form onSubmit={handleSearch} className="relative">
        <Input
          ref={inputRef}
          type="search"
          placeholder="검색어를 입력하세요..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setShowSuggestions(true)}
          className="pr-10"
        />
        <Button type="submit" size="icon" variant="ghost" className="absolute right-0 top-0 h-full px-3">
          <Search className="h-4 w-4" />
          <span className="sr-only">검색</span>
        </Button>
      </form>

      {/* 자동 완성 제안 */}
      {showSuggestions && suggestions.length > 0 && (
        <div ref={suggestionsRef} className="absolute z-10 mt-1 w-full rounded-md border bg-background shadow-lg">
          <ul className="py-1">
            {suggestions.map((suggestion, index) => (
              <li key={index}>
                <button
                  className="w-full px-4 py-2 text-left hover:bg-muted"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  {suggestion}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
