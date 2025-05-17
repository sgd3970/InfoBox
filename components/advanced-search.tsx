"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { format } from "date-fns"
import { ko } from "date-fns/locale"
import { CalendarIcon, Search, X } from "lucide-react"

interface AdvancedSearchProps {
  className?: string
}

export function AdvancedSearch({ className }: AdvancedSearchProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  // 검색 상태
  const [query, setQuery] = useState("")
  const [category, setCategory] = useState<string>("")
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined)
  const [dateTo, setDateTo] = useState<Date | undefined>(undefined)
  const [sortBy, setSortBy] = useState<string>("relevance")
  const [sortOrder, setSortOrder] = useState<string>("desc")

  // 카테고리 및 태그 목록
  const [categories, setCategories] = useState<{ name: string; slug: string }[]>([])
  const [tags, setTags] = useState<{ name: string; slug: string }[]>([])
  const [loading, setLoading] = useState(false)

  // URL 파라미터에서 초기 값 설정
  useEffect(() => {
    setQuery(searchParams?.get("q") || "")
    setCategory(searchParams?.get("category") || "")
    setSelectedTags(searchParams?.get("tags")?.split(",") || [])
    setSortBy(searchParams?.get("sortBy") || "relevance")
    setSortOrder(searchParams?.get("sortOrder") || "desc")

    const fromDate = searchParams?.get("dateFrom")
    if (fromDate) {
      setDateFrom(new Date(fromDate))
    }

    const toDate = searchParams?.get("dateTo")
    if (toDate) {
      setDateTo(new Date(toDate))
    }
  }, [searchParams])

  // 카테고리 및 태그 목록 가져오기
  useEffect(() => {
    const fetchCategoriesAndTags = async () => {
      setLoading(true)
      try {
        // 카테고리 가져오기
        const categoriesRes = await fetch("/api/categories")
        if (categoriesRes.ok) {
          const categoriesData = await categoriesRes.json()
          setCategories(categoriesData)
        }

        // 태그 가져오기
        const tagsRes = await fetch("/api/tags")
        if (tagsRes.ok) {
          const tagsData = await tagsRes.json()
          setTags(tagsData)
        }
      } catch (error) {
        console.error("카테고리 및 태그 가져오기 오류:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchCategoriesAndTags()
  }, [])

  // 검색 실행
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()

    // 검색 파라미터 구성
    const params = new URLSearchParams()

    if (query) params.set("q", query)
    if (category) params.set("category", category)
    if (selectedTags.length > 0) params.set("tags", selectedTags.join(","))
    if (dateFrom) params.set("dateFrom", format(dateFrom, "yyyy-MM-dd"))
    if (dateTo) params.set("dateTo", format(dateTo, "yyyy-MM-dd"))
    if (sortBy) params.set("sortBy", sortBy)
    if (sortOrder) params.set("sortOrder", sortOrder)

    // 검색 페이지로 이동
    router.push(`/search?${params.toString()}`)
  }

  // 검색 초기화
  const resetSearch = () => {
    setQuery("")
    setCategory("")
    setSelectedTags([])
    setDateFrom(undefined)
    setDateTo(undefined)
    setSortBy("relevance")
    setSortOrder("desc")
  }

  // 태그 선택 토글
  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
  }

  return (
    <form onSubmit={handleSearch} className={className}>
      <div className="space-y-4">
        {/* 검색어 입력 */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            type="search"
            placeholder="검색어를 입력하세요..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* 고급 검색 옵션 - 각 항목을 별도 줄에 배치 */}
        {/* 카테고리 선택 */}
        <div className="space-y-2">
          <Label htmlFor="category">카테고리</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger id="category">
              <SelectValue placeholder="모든 카테고리" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">모든 카테고리</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.slug} value={cat.slug}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* 정렬 옵션 */}
        <div className="space-y-2">
          <Label htmlFor="sortBy">정렬</Label>
          <div className="flex gap-2">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger id="sortBy" className="flex-1">
                <SelectValue placeholder="관련성" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relevance">관련성</SelectItem>
                <SelectItem value="date">날짜</SelectItem>
                <SelectItem value="views">조회수</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortOrder} onValueChange={setSortOrder}>
              <SelectTrigger id="sortOrder" className="w-[100px]">
                <SelectValue placeholder="내림차순" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desc">내림차순</SelectItem>
                <SelectItem value="asc">오름차순</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* 날짜 범위 선택 */}
        <div className="space-y-2">
          <Label>날짜 범위</Label>
          <div className="flex gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="flex-1 justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateFrom ? format(dateFrom, "PPP", { locale: ko }) : <span>시작일</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={dateFrom} onSelect={setDateFrom} initialFocus />
              </PopoverContent>
            </Popover>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="flex-1 justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateTo ? format(dateTo, "PPP", { locale: ko }) : <span>종료일</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={dateTo} onSelect={setDateTo} initialFocus />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* 태그 선택 */}
        <div className="space-y-2">
          <Label>태그</Label>
          <div className="flex flex-wrap gap-2 max-h-28 overflow-y-auto p-2 border rounded-md">
            {loading ? (
              <div className="text-sm text-muted-foreground">로딩 중...</div>
            ) : tags.length > 0 ? (
              tags.map((tag) => (
                <label key={tag.slug} className="flex items-center space-x-2 cursor-pointer">
                  <Checkbox checked={selectedTags.includes(tag.slug)} onCheckedChange={() => toggleTag(tag.slug)} />
                  <span className="text-sm">{tag.name}</span>
                </label>
              ))
            ) : (
              <div className="text-sm text-muted-foreground">태그가 없습니다.</div>
            )}
          </div>
        </div>

        {/* 검색 버튼 */}
        <div className="flex gap-2">
          <Button type="submit" className="flex-1">
            <Search className="mr-2 h-4 w-4" />
            검색
          </Button>
          <Button type="button" variant="outline" onClick={resetSearch}>
            <X className="mr-2 h-4 w-4" />
            초기화
          </Button>
        </div>
      </div>
    </form>
  )
}
