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
async function getCategoryPosts(categorySlug: string): Promise<Post[]> {
  try {
    // 먼저 모든 카테고리 정보를 가져옴
    const categoriesRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/categories`, { next: { revalidate: 3600 } });
    const categories: Category[] = await categoriesRes.json();
    const categoryInfo = categories.find(cat => cat.slug === categorySlug);
    if (!categoryInfo) return [];
    // posts.category(한글)과 categoryInfo.name(한글)로 조회
    const searchRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/search?category=${encodeURIComponent(categoryInfo.name)}`, {
      next: { revalidate: 3600 },
    });
    if (!searchRes.ok) {
      throw new Error(`HTTP error! status: ${searchRes.status}`);
    }
    const searchData = await searchRes.json();
    const posts = searchData.posts || [];
    return posts.map((post: Post) => ({
      ...post,
      date: new Date(post.date).toISOString()
    }));
  } catch (error) {
    console.error("카테고리별 포스트 목록 가져오는 중 오류 발생:", error);
    return [];
  }
}

// Fetch all categories to find the category name by slug
async function getAllCategories(): Promise<Category[]> {
  try {
    const searchRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/categories`, {
      next: { revalidate: 3600 }, // 1시간마다 재검증
    });

    if (!searchRes.ok) {
      throw new Error(`HTTP error! status: ${searchRes.status}`);
    }
    // 바로 배열로 반환
    const categories = await searchRes.json();
    return categories;
  } catch (error) {
    console.error("카테고리 목록 가져오는 중 오류 발생:", error);
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
  const categorySlug = params.category;
  const [categories] = await Promise.all([
    getAllCategories()
  ]);
  const categoryInfo = categories.find(cat => cat.slug === categorySlug);
  if (!categoryInfo) {
    notFound();
  }
  // posts.category(한글)과 categoryInfo.name(한글)로 조회
  const posts = await getCategoryPosts(categorySlug);
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
