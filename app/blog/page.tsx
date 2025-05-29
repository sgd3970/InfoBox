import Link from "next/link"
import Image from "next/image"
import type { Post } from "@/lib/models"
import { Metadata } from "next"
import { PostThumbnail } from "@/components/PostThumbnail"

export const dynamic = "force-dynamic"

async function getPosts() {
  try {
    const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://example.com'
    // API 라우트에서 최신 포스트 가져오기
    const res = await fetch(`${BASE_URL}/api/posts/latest`, {
      cache: 'no-store'  // 캐시 비활성화
    })
    
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
      <h1 className="text-4xl font-bold mb-8 relative">
        블로그
        <span className="absolute -bottom-2 left-0 w-1/3 h-1 bg-primary/20 rounded-full" />
      </h1>

      {/* 주요 게시물 */}
      {featuredPost && (
        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-6 relative">
            주요 게시물
            <span className="absolute -bottom-1 left-0 w-1/4 h-0.5 bg-primary/20 rounded-full" />
          </h2>
          <Link href={`/blog/${featuredPost.category.toLowerCase()}/${featuredPost.slug}`} className="group">
            <div className="grid md:grid-cols-2 gap-6 items-center">
              <div className="relative aspect-video overflow-hidden rounded-lg bg-muted">
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <PostThumbnail
                  src={featuredPost.featuredImage || featuredPost.image}
                  alt={featuredPost.title}
                  width={800}
                  height={400}
                  className="object-cover transition-all duration-300 group-hover:scale-110"
                  priority
                />
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <span className="text-sm font-medium px-2 py-1 rounded-full bg-primary/10 text-primary transition-colors group-hover:bg-primary/20">
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
        <h2 className="text-2xl font-semibold mb-6 relative">
          최근 게시물
          <span className="absolute -bottom-1 left-0 w-1/4 h-0.5 bg-primary/20 rounded-full" />
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {recentPosts.map((post) => (
            <Link key={post.slug} href={`/blog/${post.category.toLowerCase()}/${post.slug}`} className="group">
              <div className="space-y-4">
                <div className="relative aspect-video overflow-hidden rounded-lg bg-muted">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <PostThumbnail
                    src={post.featuredImage || post.image}
                    alt={post.title}
                    width={400}
                    height={200}
                    className="object-cover transition-all duration-300 group-hover:scale-110"
                  />
                </div>
                <div className="space-y-2">
                  <span className="text-xs font-medium px-2 py-1 rounded-full bg-primary/10 text-primary transition-colors group-hover:bg-primary/20">
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
    title: "블로그 - InfoBox",
    description: "최신 트렌드와 기술 소식을 확인하세요.",
    openGraph: {
      title: "블로그 - InfoBox",
      description: "최신 트렌드와 기술 소식을 확인하세요.",
      type: "website",
      url: `${BASE_URL}/blog`,
    },
    alternates: {
      canonical: `${BASE_URL}/blog`,
    },
  }
}
