import Link from "next/link"
import Image from "next/image"
import { notFound } from "next/navigation"
import type { Post } from "@/lib/models"

interface CategoryPageProps {
  params: {
    category: string
  }
}

async function getCategoryPosts(category: string): Promise<Post[]> {
  try {
    // 환경 변수 사용 (fallback 포함)
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const searchRes = await fetch(`${apiUrl}/api/search?category=${encodeURIComponent(category)}&limit=1000`);
    if (searchRes.ok) {
      const searchData = await searchRes.json();
      return searchData.posts || [];
    } else {
      console.error("카테고리별 포스트 목록 가져오기 실패", searchRes.status);
      return [];
    }
  } catch (error) {
    console.error("카테고리 포스트 가져오기 오류:", error)
    return []
  }
}

export async function generateMetadata({ params }: CategoryPageProps) {
  const category = decodeURIComponent(params.category)
  const formattedCategory = category.charAt(0).toUpperCase() + category.slice(1)

  return {
    title: `${formattedCategory} | 블로그`,
    description: `${formattedCategory} 카테고리의 모든 게시물을 확인하세요.`,
  }
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const category = decodeURIComponent(params.category)
  const formattedCategory = category.charAt(0).toUpperCase() + category.slice(1)

  const posts = await getCategoryPosts(formattedCategory)

  return (
    <div className="container py-10">
      <div className="mb-8">
        <h1 className="text-4xl font-bold">{formattedCategory}</h1>
        <p className="text-muted-foreground mt-2">{posts.length}개의 게시물이 있습니다.</p>
        
      </div>

      {posts.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <Link key={post.slug} href={`/blog/${post.category.toLowerCase()}/${post.slug}`} className="group">
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
