import type { Post } from "./models"
import { getDatabase } from "./mongodb"

// contentlayer/generated에서 가져오는 allPosts 대신 사용할 모의 데이터
// const allPosts: Post[] = [
//   {
//     title: "Next.js와 MDX로 블로그 만들기",
//     description: "Next.js와 MDX를 활용하여 최신 블로그를 구축하는 방법을 알아봅니다.",
//     date: "2023-05-16",
//     category: "Development",
//     slug: "nextjs-mdx-blog",
//     tags: ["Next.js", "MDX", "React", "블로그"],
//     image: "/placeholder.svg?height=400&width=800",
//     author: "홍길동",
//     featured: true,
//     body: {
//       code: "export default function MDXContent() { return <div><h1>Next.js와 MDX로 블로그 만들기</h1><p>이 글에서는 Next.js와 MDX를 활용하여 블로그를 만드는 방법을 알아봅니다.</p></div> }",
//     },
//     views: 0,
//     createdAt: new Date(),
//     updatedAt: new Date(),
//   },\n//   // 다른 모의 데이터는 생략...
// ]

// 기본 검색 함수 - API 라우트 사용
export const searchPosts = async (searchTerm: string): Promise<Post[]> => {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/search?q=${encodeURIComponent(searchTerm)}`, {
      next: { revalidate: 60 }, // 필요에 따라 캐싱 설정
    })

    if (!res.ok) {
      console.error("검색 API 호출 실패:", res.status)
      return []
    }

    const searchResults = await res.json()
    return searchResults as Post[]
  } catch (error) {
    console.error("검색 fetch 오류:", error)
    return []
  }
};

// 고급 검색 함수 - API 라우트 사용
export interface SearchOptions {
  query?: string
  category?: string
  tags?: string[]
  dateFrom?: string
  dateTo?: string
  sortBy?: string
  sortOrder?: "asc" | "desc"
  page?: number
  limit?: number
}

export const advancedSearch = async (options: SearchOptions): Promise<{ results: Post[], total: number, pages: number }> => {
  try {
    const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://example.com'
    const params = new URLSearchParams()
    if (options.query) params.append('q', options.query)
    if (options.category) params.append('category', options.category)
    if (options.tags && options.tags.length > 0) params.append('tags', options.tags.join(','))
    if (options.dateFrom) params.append('dateFrom', options.dateFrom)
    if (options.dateTo) params.append('dateTo', options.dateTo)
    if (options.sortBy) params.append('sortBy', options.sortBy)
    if (options.sortOrder) params.append('sortOrder', options.sortOrder)
    if (options.page) params.append('page', options.page.toString())
    if (options.limit) params.append('limit', options.limit.toString())

    const res = await fetch(`${BASE_URL}/api/search?${params.toString()}`, {
      next: { revalidate: 60 }, // 필요에 따라 캐싱 설정
    })

    if (!res.ok) {
        console.error("고급 검색 API 호출 실패:", res.status)
        return { results: [], total: 0, pages: 0 }
    }

    const searchResults = await res.json()
    return searchResults as { results: Post[], total: number, pages: number }
  } catch (error) {
    console.error("고급 검색 fetch 오류:", error)
    return { results: [], total: 0, pages: 0 }
  }
};

// 검색 제안 함수 - API 라우트 사용
export const getSearchSuggestions = async (query: string): Promise<string[]> => {
    try {
        const res = await fetch(`/api/search/suggestions?q=${encodeURIComponent(query)}`, {
            next: { revalidate: 60 }, // 필요에 따라 캐싱 설정
        })

        if (!res.ok) {
            console.error("검색 제안 API 호출 실패:", res.status)
            return []
        }

        const suggestions = await res.json()
        return suggestions as string[]
    } catch (error) {
        console.error("검색 제안 fetch 오류:", error)
        return []
    }
}
