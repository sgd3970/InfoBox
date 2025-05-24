import type { Post } from "./models"
import { getDatabase } from "@/lib/mongodb" // getDatabase 임포트
import { ObjectId } from 'mongodb'; // ObjectId 임포트

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

// 고급 검색 함수 - API 라우트 사용 -> 데이터베이스 직접 접근으로 변경
export interface SearchOptions {
  query?: string;
  category?: string;
  tags?: string[];
  dateFrom?: string;
  dateTo?: string;
  sortBy?: "relevance" | "date" | "views"; // sortBy 타입 수정
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}

export const advancedSearch = async (options: SearchOptions): Promise<{ results: Post[], total: number, pages: number }> => {
  try {
    const db = await getDatabase();
    const collection = db.collection<Post>("posts");

    const { query, category, tags, dateFrom, dateTo, sortBy, sortOrder, page = 1, limit = 10 } = options;

    // MongoDB 쿼리 구성
    const mongoQuery: any = {};

    if (query) {
      // 검색어 쿼리 (제목, 설명, 내용, 태그에서 검색)
      mongoQuery.$or = [
        { title: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { content: { $regex: query, $options: 'i' } },
        { tags: { $regex: query, $options: 'i' } }, // 태그 배열 내에서 regex 검색
      ];
    }

    if (category) {
      mongoQuery.category = category; // category 필드로 변경
    }

    if (tags && tags.length > 0) {
      // 태그 배열에 하나라도 포함되는 포스트 검색
      mongoQuery.tags = { $in: tags }; // 태그 이름 자체 사용
    }

    if (dateFrom || dateTo) {
      mongoQuery.date = {};
      if (dateFrom) {
        mongoQuery.date.$gte = new Date(dateFrom);
      }
      if (dateTo) {
        // 자정까지 포함하도록 날짜를 하루 더합니다.
        const dateToInclusive = new Date(dateTo);
        dateToInclusive.setDate(dateToInclusive.getDate() + 1);
        mongoQuery.date.$lt = dateToInclusive;
      }
    }

    // 전체 포스트 수 계산 (페이지네이션용)
    const total = await collection.countDocuments(mongoQuery);
    const pages = Math.ceil(total / limit);

    // 정렬 옵션 구성
    const sortOptions: any = {};
    if (sortBy === "date") {
      sortOptions.date = sortOrder === "asc" ? 1 : -1;
    } else if (sortBy === "views") {
      sortOptions.views = sortOrder === "asc" ? 1 : -1;
    } else {
      // 관련성 정렬 (기본값 또는 쿼리 있을 때)
      // MongoDB 텍스트 검색 점수를 사용하거나, 여기서는 단순 날짜 내림차순 또는 다른 기준으로 대체
      // 정식 텍스트 검색을 사용하려면 인덱스 필요. 여기서는 날짜 최신순으로 대체
      sortOptions.date = -1;
    }

    // 페이지네이션 옵션
    const skip = (page - 1) * limit;

    // 검색 결과 가져오기
    const results = await collection
      .find(mongoQuery)
      .sort(sortOptions)
      .skip(skip < 0 ? 0 : skip) // 음수 skip 방지
      .limit(limit)
      .toArray();

    // _id를 문자열로 변환하여 직렬화 가능하게 함
    const serializableResults = results.map(post => ({
        ...post,
        _id: post._id.toString(),
    }))

    return { results: serializableResults, total, pages };

  } catch (error) {
    console.error("고급 검색 함수 오류:", error);
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