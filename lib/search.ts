import type { Post } from "./models"

// contentlayer/generated에서 가져오는 allPosts 대신 사용할 모의 데이터
const allPosts: Post[] = [
  {
    title: "Next.js와 MDX로 블로그 만들기",
    description: "Next.js와 MDX를 활용하여 최신 블로그를 구축하는 방법을 알아봅니다.",
    date: "2023-05-16",
    category: "Development",
    slug: "nextjs-mdx-blog",
    tags: ["Next.js", "MDX", "React", "블로그"],
    image: "/placeholder.svg?height=400&width=800",
    author: "홍길동",
    featured: true,
    body: {
      code: "export default function MDXContent() { return <div><h1>Next.js와 MDX로 블로그 만들기</h1><p>이 글에서는 Next.js와 MDX를 활용하여 블로그를 만드는 방법을 알아봅니다.</p></div> }",
    },
    views: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  // 다른 모의 데이터는 생략...
]

// 기본 검색 함수
export const searchPosts = (searchTerm: string): Post[] => {
  if (!searchTerm) {
    return allPosts
  }

  const lowerSearchTerm = searchTerm.toLowerCase()

  return allPosts.filter((post) => {
    const titleMatch = post.title.toLowerCase().includes(lowerSearchTerm)
    const descriptionMatch = post.description.toLowerCase().includes(lowerSearchTerm)
    const categoryMatch = post.category.toLowerCase().includes(lowerSearchTerm)
    const tagsMatch = post.tags?.some((tag) => tag.toLowerCase().includes(lowerSearchTerm))

    return titleMatch || descriptionMatch || categoryMatch || tagsMatch
  })
}

// 고급 검색 옵션 타입
export interface SearchOptions {
  query: string
  category?: string
  tags?: string[]
  dateFrom?: string
  dateTo?: string
  sortBy?: "relevance" | "date" | "views"
  sortOrder?: "asc" | "desc"
  page?: number
  limit?: number
}

// 고급 검색 함수
export async function advancedSearch(options: SearchOptions): Promise<{
  posts: Post[]
  total: number
  page: number
  limit: number
  pages: number
}> {
  try {
    const {
      query,
      category,
      tags,
      dateFrom,
      dateTo,
      sortBy = "relevance",
      sortOrder = "desc",
      page = 1,
      limit = 10,
    } = options

    // MongoDB 연결이 설정되어 있지 않거나 오류가 발생할 경우 모의 데이터 사용
    let filteredPosts = searchPosts(query)

    // 카테고리 필터링
    if (category && category !== "all") {
      filteredPosts = filteredPosts.filter((post) => post.category.toLowerCase() === category.toLowerCase())
    }

    // 태그 필터링
    if (tags && tags.length > 0) {
      filteredPosts = filteredPosts.filter((post) => post.tags?.some((tag) => tags.includes(tag)))
    }

    // 날짜 범위 필터링
    if (dateFrom || dateTo) {
      filteredPosts = filteredPosts.filter((post) => {
        const postDate = new Date(post.date).getTime()
        const fromDate = dateFrom ? new Date(dateFrom).getTime() : 0
        const toDate = dateTo ? new Date(dateTo).getTime() : Number.POSITIVE_INFINITY

        return postDate >= fromDate && postDate <= toDate
      })
    }

    // 정렬
    filteredPosts.sort((a, b) => {
      if (sortBy === "date") {
        const dateA = new Date(a.date).getTime()
        const dateB = new Date(b.date).getTime()
        return sortOrder === "asc" ? dateA - dateB : dateB - dateA
      } else if (sortBy === "views") {
        return sortOrder === "asc" ? a.views - b.views : b.views - a.views
      }
      // 기본적으로 관련성(제목 알파벳순)으로 정렬
      return sortOrder === "asc" ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title)
    })

    // 페이지네이션
    const total = filteredPosts.length
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedPosts = filteredPosts.slice(startIndex, endIndex)

    return {
      posts: paginatedPosts,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    }
  } catch (error) {
    console.error("고급 검색 오류:", error)
    return {
      posts: [],
      total: 0,
      page: 1,
      limit: 10,
      pages: 0,
    }
  }
}

// 자동 완성 제안 가져오기
export async function getSearchSuggestions(query: string, limit = 5): Promise<string[]> {
  try {
    if (!query || query.trim().length < 2) {
      return []
    }

    // 모의 데이터에서 제안 생성
    const lowerQuery = query.toLowerCase()

    // 제목에서 제안 추출
    const titleSuggestions = allPosts
      .filter((post) => post.title.toLowerCase().includes(lowerQuery))
      .map((post) => post.title)

    // 태그에서 제안 추출
    const tagSuggestions = allPosts
      .flatMap((post) => post.tags || [])
      .filter((tag) => tag.toLowerCase().includes(lowerQuery))

    // 중복 제거 및 제한
    const suggestions = Array.from(new Set([...titleSuggestions, ...tagSuggestions])).slice(0, limit)

    return suggestions
  } catch (error) {
    console.error("검색 제안 가져오기 오류:", error)
    return []
  }
}
