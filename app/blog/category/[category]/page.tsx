import Link from "next/link"
import Image from "next/image"
import { notFound } from "next/navigation"
import type { Post, Category } from "@/lib/models"

interface CategoryPageProps {
  params: {
    category: string // category slug
  }
}

// Fetch posts for the given category slug
async function getCategoryPosts(categorySlug: string): Promise<Post[]> {
  try {
    const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://example.com'; // 절대 경로 사용
    const searchRes = await fetch(`${BASE_URL}/api/search?category=${encodeURIComponent(categorySlug)}&limit=1000`, { cache: 'no-store' });
    if (searchRes.ok) {
      const searchData = await searchRes.json();
      // API 응답 구조에 따라 결과 접근 방식이 다를 수 있습니다.
      // 만약 searchData가 { results: Post[], total: number, pages: number } 형태라면 searchData.results를 사용해야 합니다.
      // 이전 수정사항에 따라 advancedSearch는 { results: Post[], ... } 형태를 반환합니다.
      return searchData.results || [];
    } else {
      console.error("카테고리별 포스트 목록 가져오기 실패", searchRes.status);
      return [];
    }
  } catch (error) {
    console.error("카테고리 포스트 가져오기 오류:", error)
    return []
  }
}

// Fetch all categories to find the category name by slug
async function getAllCategories(): Promise<Category[]> {
  try {
    const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://example.com';
    const res = await fetch(`${BASE_URL}/api/categories`, { cache: 'no-store' });
    if (!res.ok) {
      console.error("카테고리 API 호출 실패:", res.status);
      return [];
    }
    const categories = await res.json();
    return categories as Category[];
  } catch (error) {
    console.error("모든 카테고리 fetch 오류:", error);
    return [];
  }
}

export async function generateMetadata({ params }: CategoryPageProps) {
  const categorySlug = params.category;
  const categories = await getAllCategories();
  const category = categories.find(cat => cat.slug === categorySlug);

  const formattedCategoryName = category ? category.name : decodeURIComponent(categorySlug).charAt(0).toUpperCase() + decodeURIComponent(categorySlug).slice(1);

  return {
    title: `${formattedCategoryName} | 블로그`,
    description: `${formattedCategoryName} 카테고리의 모든 게시물을 확인하세요.`, // description도 카테고리 이름 사용
  }
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const categorySlug = params.category; // category slug
  
  // 카테고리 정보 및 포스트 목록을 병렬로 가져옵니다.
  const [categories, posts] = await Promise.all([
    getAllCategories(),
    getCategoryPosts(categorySlug)
  ]);

  const category = categories.find(cat => cat.slug === categorySlug);

  // 유효한 카테고리가 없으면 404 페이지 표시
  if (!category) {
      notFound();
  }

  const formattedCategoryName = category.name; // 카테고리 이름 (한글) 사용

  return (
    <div className="container py-10">
      <div className="mb-8">
        <h1 className="text-4xl font-bold">{formattedCategoryName}</h1>
        {/* 포스트 개수는 getCategoryPosts 결과의 길이를 사용 */}
        {category && <p className="text-muted-foreground mt-2">{category.postCount}개의 게시물이 있습니다.</p>}
        
      </div>

      {posts.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <Link key={post.slug} href={`/blog/${post.categorySlug}/${post.slug}`} className="group">
              <div className="space-y-4">
                <div className="relative aspect-video overflow-hidden rounded-lg">
                  <Image
                    src={post.featuredImage || post.image || "/placeholder.svg?height=200&width=400"}
                    alt={post.title}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                  />
                </div>
                <div className="space-y-2">
                  {/* 포스트 카드에 표시되는 카테고리 이름도 슬러그가 아닌 이름을 찾아서 표시해야 할 수 있습니다. */}
                  {/* 현재 Post 타입에는 category 필드만 있고 name 필드는 없으므로, 필요시 이 부분 수정 필요. */}
                  {/* 간단하게 여기서는 post 객체에 categoryName 필드가 있다고 가정하거나, 아니면 category slug를 표시합니다. */}
                  {/* 여기서는 일단 post.category (슬러그)를 그대로 표시합니다. 필요시 name을 가져오는 로직 추가 필요 */}
                  {/* <span className="text-xs font-medium px-2 py-1 rounded-full bg-primary/10 text-primary">
                    {post.categoryName || post.category}
                  </span> */}
                  <span className="text-xs font-medium px-2 py-1 rounded-full bg-primary/10 text-primary">
                    {category.name} {/* 해당 페이지의 메인 카테고리 이름을 사용 */}
                  </span>

                  <h3 className="font-bold group-hover:text-primary transition-colors line-clamp-2">{post.title}</h3>
                </div>
                <p className="text-muted-foreground text-sm line-clamp-2">{post.description}</p>
                <div className="flex items-center text-xs text-muted-foreground">
                  <time dateTime={post.date}>
                    {new Date(post.date).toLocaleDateString("ko-KR", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </time>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground text-center">해당 카테고리는 현재 등록된 게시물이 없습니다.</p>
      )}
    </div>
  )
}
