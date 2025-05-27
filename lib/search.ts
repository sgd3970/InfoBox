import type { Post } from "./models"
import { getDatabase } from "./mongodb"

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
    const db = await getDatabase();
    const query: any = {};

    // 카테고리 필터
    if (options.category && options.category !== "all") {
      query.category = options.category;
    }
    // 태그 필터
    if (options.tags && options.tags.length > 0) {
      query.tags = { $in: options.tags };
    }
    // 날짜 필터
    if (options.dateFrom || options.dateTo) {
      query.date = {};
      if (options.dateFrom) query.date.$gte = options.dateFrom;
      if (options.dateTo) query.date.$lte = options.dateTo;
    }
    // 검색어(제목/설명/내용 텍스트 검색)
    if (options.query && options.query.trim() !== "") {
      query.$or = [
        { title: { $regex: options.query, $options: "i" } },
        { description: { $regex: options.query, $options: "i" } },
        { content: { $regex: options.query, $options: "i" } },
      ];
    }

    // 정렬
    let sort: any = {};
    if (options.sortBy === "date") {
      sort.date = options.sortOrder === "asc" ? 1 : -1;
    } else if (options.sortBy === "views") {
      sort.views = options.sortOrder === "asc" ? 1 : -1;
    } else {
      // 기본: 최신순
      sort.date = -1;
    }

    // 페이지네이션
    const page = options.page && options.page > 0 ? options.page : 1;
    const limit = options.limit && options.limit > 0 ? options.limit : 10;
    const skip = (page - 1) * limit;

    // 총 개수
    const total = await db.collection("posts").countDocuments(query);
    // 결과
    const rawResults = await db.collection("posts")
      .find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .toArray();
    const results: Post[] = rawResults.map((doc: any) => ({
      _id: doc._id?.toString(),
      title: doc.title,
      description: doc.description,
      content: doc.content,
      date: doc.date,
      category: doc.category,
      slug: doc.slug,
      tags: doc.tags || [],
      image: doc.image,
      images: doc.images,
      featuredImage: doc.featuredImage,
      author: doc.author,
      authorId: doc.authorId,
      featured: doc.featured,
      views: doc.views || 0,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    }));
    const pages = Math.ceil(total / limit);

    return { results, total, pages };
  } catch (error) {
    console.error("고급 검색 DB 오류:", error);
    return { results: [], total: 0, pages: 0 };
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
