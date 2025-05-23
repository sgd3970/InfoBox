import type { Post } from "./models"
import { getDatabase } from "@/lib/mongodb" // getDatabase 임포트
import { ObjectId } from 'mongodb'; // ObjectId 임포트



export const searchPosts = async (searchTerm: string): Promise<Post[]> => {
  try {
    const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://example.com'
    const res = await fetch(`${BASE_URL}/api/search?q=${encodeURIComponent(searchTerm)}`, {
      next: { revalidate: 60 }, // 필요에 따라 캐싱 설정
    })

    if (!res.ok) {
      console.error("검색 API 호출 실패:", res.status)
      return []
    }

    const searchResults = await res.json()
    // API에서 받아온 results 배열을 사용합니다.
    return (searchResults.results || []) as Post[];

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
      // 검색어 쿼리 (제목, 설명, 내용에서 검색)
      // 태그 검색은 별도의 find 쿼리로 처리하거나 $text 인덱스 필요. 여기서는 제목, 설명, 내용만 검색
      mongoQuery.$or = [
        { title: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        // ReactQuill로 저장된 content는 HTML이므로 $regex 검색 시 주의 필요.
        // 정확한 텍스트 검색을 위해서는 $text 인덱스를 사용하거나,
        // 여기서는 HTML 태그를 제거한 텍스트 필드를 별도로 저장하는 것을 고려할 수 있습니다.
        // 간단하게 현재는 content 포함 검색을 유지하되, 성능이나 정확도는 제한될 수 있습니다.
        { content: { $regex: query, $options: 'i' } },
      ];
    }

    if (category) {
      mongoQuery.category = category;
    }

    if (tags && tags.length > 0) {
      // 태그 배열에 하나라도 포함되는 포스트 검색
      mongoQuery.tags = { $in: tags };
    }

    if (dateFrom || dateTo) {
      mongoQuery.date = {};
      if (dateFrom) {
        // 날짜 문자열을 Date 객체로 변환
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
      // MongoDB 텍스트 검색 점수를 사용하거나, 여기서는 단순 날짜 내림차순으로 대체
      // 정식 텍스트 검색을 사용하려면 Atlas Search 또는 $text 인덱스 필요.
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
    // 오류 발생 시 빈 결과 반환
    return { results: [], total: 0, pages: 0 };
  }
};

// 검색 제안 함수 - API 라우트 사용
export const getSearchSuggestions = async (query: string): Promise<string[]> => {
    try {
        const BASE_URL = process.env.NEXT_PUBLIC_API_URL || ''; // 환경 변수 사용 또는 기본 URL 설정
        const res = await fetch(`${BASE_URL}/api/search/suggestions?q=${encodeURIComponent(query)}`, {
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