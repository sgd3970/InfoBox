import type { Post, Category } from "@/lib/models"
import clientPromise from "@/lib/mongodb"

// export interface Post {
//   title: string
//   description: string
//   date: string
//   category: string
//   slug: string
//   tags?: string[]
//   image?: string
//   author?: string
//   featured?: boolean
//   body: {
//     code: string
//   }
// }

// export interface Category {
//   slug: string;
//   name: string;
//   postCount: number;
// }

// getCategories 함수는 더 이상 사용되지 않으므로 제거합니다.

// 다른 함수들은 필요에 따라 유지하거나 API 라우트로 이동시킬 수 있습니다.

// 예시: 단일 포스트 가져오기 함수 (API 라우트 사용)
export const getPost = async (slug: string): Promise<Post | null> => {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/posts/${slug}`, {
      next: { revalidate: 60 }, // 필요에 따라 캐싱 설정
    });

    if (!res.ok) {
      console.error("포스트 API 호출 실패:", res.status);
      return null;
    }

    const post = await res.json();
    return post as Post;
  } catch (error) {
    console.error("포스트 fetch 오류:", error);
    return null;
  }
};

// 수정: allPosts가 정의되지 않아 발생하는 오류를 해결하기 위해 임시로 빈 배열로 정의
const allPosts: Post[] = [];

// 기본 검색 함수 - Update searchPosts or remove if not used elsewhere
export const searchPosts = async (searchTerm: string): Promise<Post[]> => { return []; };
