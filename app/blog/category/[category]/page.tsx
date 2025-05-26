import Link from "next/link"
import Image from "next/image"
import { notFound } from "next/navigation"
import type { Post, Category } from "@/lib/models"

interface CategoryPageProps {
  params: {
    category: string
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
  const slug = decodeURIComponent(params.category);

  // 1. 카테고리 정보에서 slug로 정확히 찾기
  const categoryRes = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/categories`, { cache: 'no-store' });
  const categories = await categoryRes.json();
  const categoryInfo = categories.find((c: Category) => c.slug === slug);

  if (!categoryInfo) {
    return <div>존재하지 않는 카테고리입니다.</div>;
  }

  // 2. name으로 게시물 검색
  const searchRes = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/search?category=${encodeURIComponent(categoryInfo.name)}&limit=1000`, { cache: 'no-store' });
  const searchData = searchRes.ok ? await searchRes.json() : { posts: [] };
  const posts = searchData.posts || [];

  return (
    <div className="container py-10">
      <div className="mb-8">
        <h1 className="text-4xl font-bold">{categoryInfo.name}</h1>
        <p className="text-muted-foreground mt-2">{posts.length}개의 게시물이 있습니다.</p>
      </div>

      {posts.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {(posts as Post[]).map((post) => (
            <Link key={post.slug} href={`/blog/${categoryInfo.slug}/${post.slug}`} className="group">
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
