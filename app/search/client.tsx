"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import Image from "next/image"
import { useSearchParams } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Pagination } from "@/components/ui/pagination"
import { Loader2 } from "lucide-react"
import { AdvancedSearch } from "@/components/advanced-search"
import type { Post } from "@/lib/models"
import { useRouter } from "next/navigation"

export function SearchClient() {
  const searchParams = useSearchParams()
  const router = useRouter()

  // Initialize states from search params
  const [query, setQuery] = useState(searchParams?.get("q") || "")
  const [category, setCategory] = useState(searchParams?.get("category") || "")
  const tags = useMemo(() => searchParams?.get("tags")?.split(",") || [], [searchParams])
  const [dateFrom, setDateFrom] = useState(searchParams?.get("dateFrom") || "")
  const [dateTo, setDateTo] = useState(searchParams?.get("dateTo") || "")
  const [sortBy, setSortBy] = useState(searchParams?.get("sortBy") || "relevance")
  const [sortOrder, setSortOrder] = useState(searchParams?.get("sortOrder") || "desc")
  const [page, setPage] = useState(Number(searchParams?.get("page") || "1"))
  const [limit, setLimit] = useState(Number(searchParams?.get("limit") || "10"))

  const [searchResults, setSearchResults] = useState<Post[]>([])
  const [total, setTotal] = useState(0)
  const [pages, setPages] = useState(0)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("all")
  const [categories, setCategories] = useState<string[]>([])
  const [selectedCategory, setSelectedCategory] = useState("all")

  // Calculate unique categories from search results
  const uniqueCategories = useMemo(() => {
    return ["all", ...new Set(searchResults.map((post: Post) => post.category.toLowerCase()))]
  }, [searchResults])

  // Effect to update state when search params change
  useEffect(() => {
    setQuery(searchParams?.get("q") || "")
    setCategory(searchParams?.get("category") || "")
    setDateFrom(searchParams?.get("dateFrom") || "")
    setDateTo(searchParams?.get("dateTo") || "")
    setSortBy(searchParams?.get("sortBy") || "relevance")
    setSortOrder(searchParams?.get("sortOrder") || "desc")
    setPage(Number(searchParams?.get("page") || "1"))
    setLimit(Number(searchParams?.get("limit") || "10"))
  }, [searchParams])

  // 검색 실행
  useEffect(() => {
    const fetchSearchResults = async () => {
      console.log("Fetching search results...", { query, category, tags, dateFrom, dateTo, sortBy, sortOrder, page, limit })
      setLoading(true)

      try {
        // 검색 파라미터 구성
        const params = new URLSearchParams()

        if (query) params.set("q", query)
        if (category) params.set("category", category)
        if (tags.length > 0) params.set("tags", tags.join(","))
        if (dateFrom) params.set("dateFrom", dateFrom)
        if (dateTo) params.set("dateTo", dateTo)
        if (sortBy) params.set("sortBy", sortBy)
        if (sortOrder) params.set("sortOrder", sortOrder)
        params.set("page", page.toString())
        params.set("limit", limit.toString())

        // 검색 API 호출
        const BASE_URL = process.env.NEXT_PUBLIC_API_URL || ''; // 환경 변수 사용 또는 기본 URL 설정
        const res = await fetch(`${BASE_URL}/api/search?${params.toString()}`, { cache: 'no-store' })

        if (!res.ok) {
          throw new Error("검색 중 오류가 발생했습니다.")
        }

        const data = await res.json()
        console.log("Search results fetched successfully:", data)
        console.log("Current searchResults state before update:", searchResults)

        const results = (data.results || []) as Post[]
        setSearchResults(results)
        setTotal(data.total || 0)
        setPages(data.pages || 0)

        // Update categories with type assertion
        const categorySet = new Set(results.map((post: Post) => post.category.toLowerCase()))
        setCategories(["all", ...Array.from(categorySet)])

      } catch (error) {
        console.error("검색 오류:", error)
      } finally {
        console.log("Finished fetching search results.")
        console.log("Current searchResults state after update:", searchResults)
        setLoading(false)
      }
    }

    fetchSearchResults()
  }, [query, category, tags, dateFrom, dateTo, sortBy, sortOrder, page, limit])

  // 카테고리별 결과 필터링
  const filterByCategory = (category: string): Post[] => {
    if (category === "all") {
      setSelectedCategory("all")
      return searchResults
    }
    setSelectedCategory(category)
    return searchResults.filter((post) => post.category.toLowerCase() === category.toLowerCase())
  }

  const filteredPosts = useMemo(() => {
    if (!Array.isArray(searchResults)) return [];
    if (selectedCategory === "all") {
      return searchResults;
    }
    return searchResults.filter((post) => post && post.category && post.category.toLowerCase() === selectedCategory.toLowerCase());
  }, [searchResults, selectedCategory]);

  // 검색어 하이라이트 함수
  const highlightText = (text: string) => {
    if (!query.trim()) return text

    const regex = new RegExp(`(${query.trim()})`, "gi")
    return text.replace(regex, '<mark class="bg-yellow-200 dark:bg-yellow-800">$1</mark>')
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-8">
      {/* 검색 사이드바 */}
      <div className="space-y-6">
        <AdvancedSearch />

        {/* 검색 필터 요약 */}
        {(category || tags.length > 0 || dateFrom || dateTo) && (
          <div className="border rounded-md p-4">
            <h3 className="font-medium mb-2">적용된 필터</h3>
            <div className="space-y-2 text-sm">
              {category && (
                <div className="flex justify-between">
                  <span>카테고리:</span>
                  <span className="font-medium">{category}</span>
                </div>
              )}

              {tags.length > 0 && (
                <div className="flex justify-between">
                  <span>태그:</span>
                  <span className="font-medium">{tags.join(", ")}</span>
                </div>
              )}

              {dateFrom && (
                <div className="flex justify-between">
                  <span>시작일:</span>
                  <span className="font-medium">{dateFrom}</span>
                </div>
              )}

              {dateTo && (
                <div className="flex justify-between">
                  <span>종료일:</span>
                  <span className="font-medium">{dateTo}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>정렬:</span>
                <span className="font-medium">
                  {sortBy === "relevance" ? "관련성" : sortBy === "date" ? "날짜" : "조회수"} (
                  {sortOrder === "desc" ? "내림차순" : "오름차순"})
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 검색 결과 */}
      <div>
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : searchResults.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">검색 결과가 없습니다.</p>
            <p className="text-sm text-muted-foreground mt-2">다른 검색어로 시도해보세요.</p>
          </div>
        ) : (
          <div>
            <p className="text-muted-foreground mb-6">
              {query.trim() !== "" ? `"${query}"에 대한 ` : ""}
              검색 결과: {total}개
            </p>

            {categories.length > 1 && (
              <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mb-8">
                <TabsList>
                  <TabsTrigger value="all">전체 ({searchResults.length})</TabsTrigger>
                  {categories.map((cat) => {
                    const filteredResults = filterByCategory(cat);
                    return (
                      <TabsTrigger key={cat} value={cat}>
                        {cat.charAt(0).toUpperCase() + cat.slice(1)} ({filteredResults.length})
                      </TabsTrigger>
                    );
                  })}
                </TabsList>

                <TabsContent value="all" className="mt-6">
                  <div className="space-y-6">
                    {Array.isArray(filteredPosts) && filteredPosts.map((post) => (
                      post && (
                        <Link key={post.slug} href={`/blog/${post.category}/${post.slug}`} className="group border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                          <div className="space-y-4">
                            <div className="relative aspect-video overflow-hidden rounded-lg">
                              <Image
                                src={
                                  post.featuredImage && post.featuredImage !== ""
                                    ? post.featuredImage
                                    : post.image && post.image !== ""
                                    ? post.image
                                    : "/placeholder.svg?height=200&width=400"
                                }
                                alt={post.title}
                                fill
                                className="object-cover transition-transform group-hover:scale-105"
                              />
                            </div>
                            <div className="p-4 space-y-2">
                              <span className="text-xs font-medium px-2 py-1 rounded-full bg-primary/10 text-primary">
                                {post.category}
                              </span>
                              <h3
                                className="text-xl font-bold group-hover:text-primary transition-colors"
                                dangerouslySetInnerHTML={{ __html: highlightText(post.title) }}
                              />
                              <p
                                className="text-muted-foreground line-clamp-2"
                                dangerouslySetInnerHTML={{ __html: highlightText(post.description) }}
                              />
                              <div className="flex items-center text-xs text-muted-foreground">
                                <time dateTime={post.date}>
                                  {new Date(post.date).toLocaleDateString("ko-KR", {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                  })}
                                </time>
                                <span className="mx-2">•</span>
                                <span>{post.views.toLocaleString()} 조회</span>
                              </div>
                            </div>
                          </div>
                        </Link>
                      )
                    ))}
                  </div>
                </TabsContent>

                {categories.map((cat) => {
                  const filteredResults = filterByCategory(cat);
                  return (
                    <TabsContent key={cat} value={cat} className="mt-6">
                      <div className="space-y-6">
                        {filteredResults.map((post) => (
                          <Link key={post.slug} href={`/blog/${post.category}/${post.slug}`} className="group border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                            <div className="space-y-4">
                              <div className="relative aspect-video overflow-hidden rounded-lg">
                                <Image
                                  src={
                                    post.featuredImage && post.featuredImage !== ""
                                      ? post.featuredImage
                                      : post.image && post.image !== ""
                                      ? post.image
                                      : "/placeholder.svg?height=200&width=400"
                                  }
                                  alt={post.title}
                                  fill
                                  className="object-cover transition-transform group-hover:scale-105"
                                />
                              </div>
                              <div className="p-4 space-y-2">
                                <span className="text-xs font-medium px-2 py-1 rounded-full bg-primary/10 text-primary">
                                  {post.category}
                                </span>
                                <h3
                                  className="text-xl font-bold group-hover:text-primary transition-colors"
                                  dangerouslySetInnerHTML={{ __html: highlightText(post.title) }}
                                />
                                <p
                                  className="text-muted-foreground line-clamp-2"
                                  dangerouslySetInnerHTML={{ __html: highlightText(post.description) }}
                                />
                                <div className="flex items-center text-xs text-muted-foreground">
                                  <time dateTime={post.date}>
                                    {new Date(post.date).toLocaleDateString("ko-KR", {
                                      year: "numeric",
                                      month: "long",
                                      day: "numeric",
                                    })}
                                  </time>
                                  <span className="mx-2">•</span>
                                  <span>{post.views?.toLocaleString() || 0} 조회</span>
                                </div>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </TabsContent>
                  );
                })}
              </Tabs>
            )}

            {categories.length <= 1 && (
              <div className="space-y-6 mb-8">
                {Array.isArray(filteredPosts) && filteredPosts.map((post) => (
                  post && (
                    <Link key={post.slug} href={`/blog/${post.category}/${post.slug}`} className="group border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="space-y-4">
                        <div className="relative aspect-video overflow-hidden rounded-lg">
                          <Image
                            src={
                              post.featuredImage && post.featuredImage !== ""
                                ? post.featuredImage
                                : post.image && post.image !== ""
                                ? post.image
                                : "/placeholder.svg?height=200&width=400"
                            }
                            alt={post.title}
                            fill
                            className="object-cover transition-transform group-hover:scale-105"
                          />
                        </div>
                        <div className="p-4 space-y-2">
                          <span className="text-xs font-medium px-2 py-1 rounded-full bg-primary/10 text-primary">
                            {post.category}
                          </span>
                          <h3
                            className="text-xl font-bold group-hover:text-primary transition-colors"
                            dangerouslySetInnerHTML={{ __html: highlightText(post.title) }}
                          />
                          <p
                            className="text-muted-foreground line-clamp-2"
                            dangerouslySetInnerHTML={{ __html: highlightText(post.description) }}
                          />
                          <div className="flex items-center text-xs text-muted-foreground">
                            <time dateTime={post.date}>
                              {new Date(post.date).toLocaleDateString("ko-KR", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })}
                            </time>
                            <span className="mx-2">•</span>
                            <span>{post.views.toLocaleString()} 조회</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  )
                ))}
              </div>
            )}

            {/* 페이지네이션 */}
            {pages > 1 && (
              <Pagination
                currentPage={page}
                totalPages={pages}
                onPageChange={(newPage) => {
                  // 페이지 변경 시 URL 업데이트 및 page 상태 업데이트
                  const params = new URLSearchParams(searchParams?.toString())
                  params.set("page", newPage.toString())
                  router.push(`/search?${params.toString()}`)
                  setPage(newPage)
                }}
              />
            )}
          </div>
        )}
      </div>
    </div>
  )
}
