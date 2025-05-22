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
        const res = await fetch(`/api/search?${params.toString()}`, { cache: 'no-store' })

        if (!res.ok) {
          throw new Error("검색 중 오류가 발생했습니다.")
        }

        const data = await res.json()
        console.log("Search results fetched successfully:", data)
        console.log("Current searchResults state before update:", searchResults)

        setSearchResults(data.posts)
        setTotal(data.total)
        setPages(data.pages)

        // Calculate and set categories here
        const uniqueCategories = Array.from(new Set((data.posts as Post[]).map((post) => post.category.toLowerCase())));
        setCategories(uniqueCategories);

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
  const filterByCategory = (categorySlug: string) => {
    if (categorySlug === "all") {
      return searchResults
    }
    return searchResults.filter((post) => post.category.toLowerCase() === categorySlug.toLowerCase())
  }

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
                  {categories.map((cat) => (
                    <TabsTrigger key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)} ({filterByCategory(cat).length})
                    </TabsTrigger>
                  ))}
                </TabsList>

                <TabsContent value="all" className="mt-6">
                  <div className="space-y-6">
                    {searchResults.map((post) => (
                      <Link key={post.slug} href={`/blog/${post.category.toLowerCase()}/${post.slug}`} className="group border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                        <div className="relative aspect-video overflow-hidden">
                          <Image
                            src={post.image || "/placeholder.svg"}
                            alt={post.title}
                            width={300}
                            height={150}
                            className="object-cover transition-transform group-hover:scale-105"
                          />
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium px-2 py-1 rounded-full bg-primary/10 text-primary">
                              {post.category}
                            </span>
                            {post.tags && post.tags.length > 0 && (
                              <div className="flex gap-1 flex-wrap">
                                {post.tags.slice(0, 3).map((tag) => (
                                  <span key={tag} className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
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
                      </Link>
                    ))}
                  </div>
                </TabsContent>

                {categories.map((cat) => (
                  <TabsContent key={cat} value={cat} className="mt-6">
                    <div className="space-y-6">
                      {filterByCategory(cat).map((post) => (
                        <Link key={post.slug} href={`/blog/${post.category.toLowerCase()}/${post.slug}`} className="group border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                          <div className="relative aspect-video overflow-hidden">
                            <Image
                              src={post.image || "/placeholder.svg"}
                              alt={post.title}
                              width={300}
                              height={150}
                              className="object-cover transition-transform group-hover:scale-105"
                            />
                          </div>
                          <div className="space-y-2 p-4">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-medium px-2 py-1 rounded-full bg-primary/10 text-primary">
                                {post.category}
                              </span>
                              {post.tags && post.tags.length > 0 && (
                                <div className="flex gap-1 flex-wrap">
                                  {post.tags.slice(0, 3).map((tag) => (
                                    <span key={tag} className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
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
                        </Link>
                      ))}
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            )}

            {categories.length <= 1 && (
              <div className="space-y-6 mb-8">
                {searchResults.map((post) => (
                  <Link key={post.slug} href={`/blog/${post.category.toLowerCase()}/${post.slug}`} className="group border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="relative aspect-video overflow-hidden">
                      <Image
                        src={post.image || "/placeholder.svg"}
                        alt={post.title}
                        width={300}
                        height={150}
                        className="object-cover transition-transform group-hover:scale-105"
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium px-2 py-1 rounded-full bg-primary/10 text-primary">
                          {post.category}
                        </span>
                        {post.tags && post.tags.length > 0 && (
                          <div className="flex gap-1 flex-wrap">
                            {post.tags.slice(0, 3).map((tag) => (
                              <span key={tag} className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
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
                  </Link>
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
