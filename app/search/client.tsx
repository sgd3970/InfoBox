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
import { PostThumbnail } from "@/components/PostThumbnail"

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
  const [categories, setCategories] = useState<(string | { name: string; slug: string })[]>([])

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

        setSearchResults(data.results || [])
        setTotal(data.total || 0)
        setPages(data.pages || 0)

        // Calculate and set categories here
        const uniqueCategories = Array.from(
          new Set(
            (data.results || []).map((post: Post) => 
              typeof post.category === 'object' && post.category !== null && 'slug' in post.category 
                ? post.category.slug 
                : post.category?.toLowerCase() || 'uncategorized'
            )
          )
        ) as string[];
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
  const filterByCategory = (cat: string | { name: string; slug: string }) => {
    return searchResults.filter(post => 
      typeof post.category === 'object' && post.category !== null && 'slug' in post.category 
        ? post.category.slug === (typeof cat === 'object' && cat !== null && 'slug' in cat ? cat.slug : cat)
        : post.category === cat
    )
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
                    <TabsTrigger key={typeof cat === 'object' && cat !== null && 'name' in cat ? cat.name : cat} value={typeof cat === 'object' && cat !== null && 'slug' in cat ? cat.slug : cat}>
                      {typeof cat === 'object' && cat !== null && 'name' in cat 
                        ? cat.name.charAt(0).toUpperCase() + cat.name.slice(1)
                        : cat.charAt(0).toUpperCase() + cat.slice(1)} ({filterByCategory(cat).length})
                    </TabsTrigger>
                  ))}
                </TabsList>

                <TabsContent value="all" className="mt-6">
                  <div className="space-y-6">
                    {searchResults.map((post) => (
                      <Link
                        key={post.slug}
                        href={`/blog/${typeof post.category === 'string' ? post.category.toLowerCase() : post.category?.slug.toLowerCase()}/${post.slug}`}
                        className="group rounded-lg bg-white dark:bg-zinc-900 shadow-sm hover:shadow-md transition-shadow border overflow-hidden flex flex-col"
                      >
                        <div className="relative aspect-video w-full overflow-hidden">
                          <PostThumbnail
                            src={post.featuredImage || post.image || ''}
                            alt={post.title}
                            width={300}
                            height={150}
                            className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                          />
                        </div>
                        <div className="flex-1 flex flex-col p-4 gap-2">
                          <span className="text-xs font-medium px-2 py-1 rounded-full bg-primary/10 text-primary w-fit">
                            {typeof post.category === 'string' ? post.category : post.category?.name}
                          </span>
                          <h3 className="text-xl font-bold group-hover:text-primary transition-colors line-clamp-2">{post.title}</h3>
                          <p className="text-muted-foreground line-clamp-2">{post.description}</p>
                          <div className="flex items-center text-xs text-muted-foreground mt-auto">
                            <time dateTime={post.date}>{new Date(post.date).toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" })}</time>
                            <span className="mx-2">•</span>
                            <span>{post.views?.toLocaleString() || 0} 조회</span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </TabsContent>

                {categories.map((cat) => (
                  <TabsContent 
                    key={typeof cat === 'string' ? cat : cat.slug} 
                    value={typeof cat === 'string' ? cat : cat.slug} 
                    className="mt-6"
                  >
                    <div className="space-y-6">
                      {filterByCategory(cat).map((post) => (
                        <Link
                          key={post.slug}
                          href={`/blog/${typeof post.category === 'string' ? post.category.toLowerCase() : post.category?.slug.toLowerCase()}/${post.slug}`}
                          className="group rounded-lg bg-white dark:bg-zinc-900 shadow-sm hover:shadow-md transition-shadow border overflow-hidden flex flex-col"
                        >
                          <div className="relative aspect-video w-full overflow-hidden">
                            <PostThumbnail
                              src={post.featuredImage || post.image || ''}
                              alt={post.title}
                              width={300}
                              height={150}
                              className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                            />
                          </div>
                          <div className="flex-1 flex flex-col p-4 gap-2">
                            <span className="text-xs font-medium px-2 py-1 rounded-full bg-primary/10 text-primary w-fit">
                              {typeof post.category === 'string' ? post.category : post.category?.name}
                            </span>
                            <h3 className="text-xl font-bold group-hover:text-primary transition-colors line-clamp-2">{post.title}</h3>
                            <p className="text-muted-foreground line-clamp-2">{post.description}</p>
                            <div className="flex items-center text-xs text-muted-foreground mt-auto">
                              <time dateTime={post.date}>{new Date(post.date).toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" })}</time>
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
                  <Link
                    key={post.slug}
                    href={`/blog/${typeof post.category === 'string' ? post.category.toLowerCase() : post.category?.slug.toLowerCase()}/${post.slug}`}
                    className="group rounded-lg bg-white dark:bg-zinc-900 shadow-sm hover:shadow-md transition-shadow border overflow-hidden flex flex-col"
                  >
                    <div className="relative aspect-video w-full overflow-hidden">
                      <PostThumbnail
                        src={post.featuredImage || post.image || ''}
                        alt={post.title}
                        width={300}
                        height={150}
                        className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                    <div className="flex-1 flex flex-col p-4 gap-2">
                      <span className="text-xs font-medium px-2 py-1 rounded-full bg-primary/10 text-primary w-fit">
                        {typeof post.category === 'string' ? post.category : post.category?.name}
                      </span>
                      <h3 className="text-xl font-bold group-hover:text-primary transition-colors line-clamp-2">{post.title}</h3>
                      <p className="text-muted-foreground line-clamp-2">{post.description}</p>
                      <div className="flex items-center text-xs text-muted-foreground mt-auto">
                        <time dateTime={post.date}>{new Date(post.date).toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" })}</time>
                        <span className="mx-2">•</span>
                        <span>{post.views?.toLocaleString() || 0} 조회</span>
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
