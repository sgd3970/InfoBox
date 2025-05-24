import Link from "next/link"
import Image from "next/image"
import { notFound } from "next/navigation"
import type { Post, Category } from "@/lib/models"
import { Metadata } from "next"

interface CategoryPageProps {
  params: {
    category: string // category slug
  }
}

// Fetch posts for the given category slug
async function getCategoryPosts(category: string): Promise<Post[]> {
  try {
    const BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';
    const searchRes = await fetch(`${BASE_URL}/api/search?category=${encodeURIComponent(category)}&limit=1000`, { cache: 'no-store' });
    if (!searchRes.ok) {
      console.error("카테고리별 포스트 목록 가져오기 실패", searchRes.status);
      return [];
    }
    const searchData = await searchRes.json();
    return searchData.posts || [];
  } catch (error) {
    console.error("카테고리별 포스트 목록 가져오는 중 오류 발생:", error);
    return [];
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

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://example.com'
  const category = params.category;

  // 카테고리 정보 가져오기
  const categories = await getAllCategories();
  const categoryInfo = categories.find(cat => cat.slug === category);

  const formattedCategoryName = categoryInfo ? categoryInfo.name : decodeURIComponent(category).charAt(0).toUpperCase() + decodeURIComponent(category).slice(1);

  return {
    title: `${formattedCategoryName} | 블로그`,
    description: `${formattedCategoryName} 카테고리의 모든 게시물을 확인하세요.`,
    openGraph: {
      title: `${formattedCategoryName} | 블로그`,
      description: `${formattedCategoryName} 카테고리의 모든 게시물을 확인하세요.`,
      type: "website",
      url: `${BASE_URL}/blog/${category}`,
    },
    alternates: {
      canonical: `${BASE_URL}/blog/${category}`,
    },
  }
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const category = params.category;
  const [posts, categories] = await Promise.all([
    getCategoryPosts(category),
    getAllCategories()
  ]);

  const categoryInfo = categories.find(cat => cat.slug === category);
  if (!categoryInfo) {
    notFound();
  }

  const formattedCategoryName = categoryInfo.name;

  return (
    <div className="container py-10">
      <div className="mb-8">
        <h1 className="text-4xl font-bold">{formattedCategoryName}</h1>
        <p className="text-muted-foreground mt-2">{posts.length}개의 게시물이 있습니다.</p>
      </div>

      {posts.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <Link key={post.slug} href={`/blog/${post.category}/${post.slug}`} className="group">
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
                  <span className="text-xs font-medium px-2 py-1 rounded-full bg-primary/10 text-primary">
                    {post.category}
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
