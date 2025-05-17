import type { Post } from "@/lib/models"
import clientPromise from "@/lib/mongodb"

export interface Post {
  title: string
  description: string
  date: string
  category: string
  slug: string
  tags?: string[]
  image?: string
  author?: string
  featured?: boolean
  body: {
    code: string
  }
}

export interface Category {
  slug: string;
  name: string;
  postCount: number;
}

export async function getCategories(): Promise<Category[]> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/categories`, {
      next: { revalidate: 3600 }
    });
    
    if (!res.ok) {
      throw new Error('카테고리를 가져오는데 실패했습니다');
    }
    
    return await res.json();
  } catch (error) {
    console.error('카테고리 가져오기 오류:', error);
    return [];
  }
}

// 수정: allPosts가 정의되지 않아 발생하는 오류를 해결하기 위해 임시로 빈 배열로 정의
const allPosts: Post[] = [];

// 기본 검색 함수 - Update searchPosts or remove if not used elsewhere
export const searchPosts = async (searchTerm: string): Promise<Post[]> => { return []; };
