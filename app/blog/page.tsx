import Link from "next/link"
import Image from "next/image"
import type { Post } from "@/lib/models"
import { Metadata } from "next"

export const dynamic = "force-dynamic"

async function getPosts() {
  try {
    // API 라우트에서 최신 포스트 가져오기
    const res = await fetch(`/api/posts/latest`, {})
    
    if (!res.ok) {
      console.error("최신 포스트 API 호출 실패:", res.status)
      return []
    }
    
    const posts = await res.json()
    return posts as Post[]
  } catch (error) {
    console.error("최신 포스트 fetch 오류:", error)
    return []
  }
}

export default async function BlogPage() {
  const posts = await getPosts()
  const featuredPost = posts.find((post) => post.featured) || posts[0]
  const recentPosts = posts.filter((post) => post !== featuredPost).slice(0, 6)

  return (
    <div className="container py-10">
      <h1 className="text-4xl font-bold mb-8">블로그</h1>

      {/* 주요 게시물 */}
      {featuredPost && (
        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">주요 게시물</h2>
          <Link href={`/blog/${featuredPost.category.toLowerCase()}/${featuredPost.slug}`} className="group">
            <div className="grid md:grid-cols-2 gap-6 items-center">
              <div className="relative aspect-video overflow-hidden rounded-lg">
                <Image
                  src={featuredPost.featuredImage || featuredPost.image || "/placeholder.svg?height=400&width=800"}
                  alt={featuredPost.title}
                  width={800}
                  height={400}
                  className="object-cover transition-transform group-hover:scale-105"
                  priority
                />
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <span className="text-sm font-medium px-2 py-1 rounded-full bg-primary/10 text-primary">
                    {featuredPost.category}
                  </span>
                  <h3 className="text-3xl font-bold group-hover:text-primary transition-colors">
                    {featuredPost.title}
                  </h3>
                </div>
                <p className="text-muted-foreground line-clamp-3">{featuredPost.description}</p>
                <div className="flex items-center text-sm text-muted-foreground">
                  <time dateTime={new Date(featuredPost.date).toISOString()}>
                    {new Date(featuredPost.date).toLocaleDateString("ko-KR", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </time>
                </div>
              </div>
            </div>
          </Link>
        </div>
      )}

      {/* 최근 게시물 */}
      <div>
        <h2 className="text-2xl font-semibold mb-6">최근 게시물</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {recentPosts.map((post) => (
            <Link key={post.slug} href={`/blog/${post.category.toLowerCase()}/${post.slug}`} className="group">
              <div className="space-y-4">
                <div className="relative aspect-video overflow-hidden rounded-lg">
                  <Image
                    src={post.featuredImage || post.image || "/placeholder.svg?height=200&width=400"}
                    alt={post.title}
                    width={400}
                    height={200}
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
                  <time dateTime={new Date(post.date).toISOString()}>
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
      </div>
    </div>
  )
}

export async function generateMetadata(): Promise<Metadata> {
  const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://example.com'

  return {
    title: "블로그 - 트렌드 스캐너",
    description: "최신 트렌드와 기술 소식을 확인하세요.",
    openGraph: {
      title: "블로그 - 트렌드 스캐너",
      description: "최신 트렌드와 기술 소식을 확인하세요.",
      type: "website",
      url: `${BASE_URL}/blog`,
    },
    alternates: {
      canonical: `${BASE_URL}/blog`,
    },
  }
}
