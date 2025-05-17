import { notFound } from "next/navigation"
import Image from "next/image"
import type { Metadata } from "next"
import Link from "next/link"
import { Comments } from "@/components/comments"
import { AIContentSummary } from "@/components/ai-content-summary"
import { AIContentRecommendations } from "@/components/ai-content-recommendations"
import { SocialShare } from "@/components/social-share"
import { SEOSchema } from "@/components/seo-schema"
import type { Post } from "@/lib/models"
import clientPromise from "@/lib/mongodb"

interface PostPageProps {
  params: {
    category: string
    slug: string
  }
}

async function getPost(slug: string): Promise<Post | null> {
  try {
    const client = await clientPromise
    const db = client.db()
    const post = await db.collection("posts").findOne({ slug }) as any as Post;

    if (!post) return null

    // 조회수 증가
    await db.collection("posts").updateOne({ slug }, { $inc: { views: 1 } })

    return post as Post
  } catch (error) {
    console.error("포스트 가져오기 오류:", error)
    return null
  }
}

async function getRelatedPosts(currentSlug: string, category: string, limit = 3): Promise<Post[]> {
  try {
    const client = await clientPromise
    const db = client.db()
    const posts = await db
      .collection("posts")
      .find({ slug: { $ne: currentSlug }, category })
      .limit(limit)
      .toArray() as any as Post[];

    return posts as Post[]
  } catch (error) {
    console.error("관련 포스트 가져오기 오류:", error)
    return []
  }
}

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const post = await getPost(params.slug)

  if (!post) {
    return {}
  }

  const ogUrl = new URL(`${process.env.NEXT_PUBLIC_APP_URL || "https://example.com"}/api/og`)
  ogUrl.searchParams.set("title", post.title)
  ogUrl.searchParams.set("category", post.category)

  return {
    title: post.title,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      url: `${process.env.NEXT_PUBLIC_APP_URL || "https://example.com"}/blog/${params.category}/${params.slug}`,
      images: [
        {
          url: post.image || ogUrl.toString(),
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
      images: [post.image || ogUrl.toString()],
    },
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_APP_URL || "https://example.com"}/blog/${params.category}/${params.slug}`,
    },
  }
}

export default async function PostPage({ params }: PostPageProps) {
  const post = await getPost(params.slug)

  if (!post) {
    notFound()
  }

  const postUrl = `${process.env.NEXT_PUBLIC_APP_URL || "https://example.com"}/blog/${params.category}/${params.slug}`

  // 관련 포스트 찾기 (같은 카테고리의 다른 포스트)
  const relatedPosts = await getRelatedPosts(params.slug, post.category)

  return (
    <>
      <SEOSchema
        type="article"
        title={post.title}
        description={post.description}
        url={postUrl}
        imageUrl={post.image}
        publishedTime={post.date}
        authorName={post.author}
        keywords={post.tags || []}
      />

      <div className="container py-10">
        <article className="max-w-3xl mx-auto">
          <div className="space-y-4 mb-8">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Link
                  href={`/blog/category/${encodeURIComponent(post.category.toLowerCase())}`}
                  className="text-sm font-medium px-2 py-1 bg-primary/10 text-primary rounded-full hover:bg-primary/20 transition-colors cursor-pointer"
                >
                  {post.category}
                </Link>
                {post.tags && post.tags.length > 0 && (
                  <div className="flex gap-1 flex-wrap">
                    {post.tags.map((tag) => (
                      <Link
                        key={tag}
                        href={`/blog/tag/${encodeURIComponent(tag)}`}
                        className="text-xs px-2 py-1 bg-muted rounded-full text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer"
                      >
                        {tag}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
              <h1 className="text-4xl font-bold">{post.title}</h1>
            </div>
            <div className="flex items-center space-x-2 text-muted-foreground">
              <time dateTime={post.date}>
                {new Date(post.date).toLocaleDateString("ko-KR", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </time>
              {post.author && (
                <>
                  <span>•</span>
                  <span>{post.author}</span>
                </>
              )}
              <span>•</span>
              <span>{post.views.toLocaleString()} 조회</span>
              <span>•</span>
              <Link
                href={`/amp/${params.category}/${params.slug}`}
                className="text-primary hover:underline"
                target="_blank"
                rel="noopener"
              >
                AMP 버전
              </Link>
            </div>
            {post.image && (
              <div className="relative aspect-video overflow-hidden rounded-lg">
                <Image
                  src={post.image || "/placeholder.svg"}
                  alt={post.title}
                  width={800}
                  height={400}
                  className="object-cover w-full"
                  priority
                />
              </div>
            )}

            {/* 소셜 공유 버튼 */}
            <div className="pt-4">
              <SocialShare url={postUrl} title={post.title} description={post.description} />
            </div>
          </div>

          {/* 광고 영역 추가 */}
          <div className="mb-8 p-4 bg-muted/30 rounded-lg text-center">
            <p className="text-sm text-muted-foreground mb-2">광고</p>
            <div className="bg-muted h-[250px] flex items-center justify-center">
              <p className="text-muted-foreground">728x90 배너 광고</p>
            </div>
          </div>

          {/* AI 콘텐츠 요약 */}
          <AIContentSummary content={post.description} />

          <div className="prose prose-lg dark:prose-invert max-w-none mt-8">
            {post.content.split("\n").map((paragraph, index) => {
              if (paragraph.startsWith("# ")) {
                return <h1 key={index}>{paragraph.substring(2)}</h1>
              } else if (paragraph.startsWith("## ")) {
                return <h2 key={index}>{paragraph.substring(3)}</h2>
              } else if (paragraph.startsWith("### ")) {
                return <h3 key={index}>{paragraph.substring(4)}</h3>
              } else if (paragraph.trim() === "") {
                return <br key={index} />
              } else {
                return <p key={index}>{paragraph}</p>
              }
            })}
          </div>

          {/* 인라인 광고 */}
          <div className="my-8 p-4 bg-muted/30 rounded-lg text-center">
            <p className="text-sm text-muted-foreground mb-2">광고</p>
            <div className="bg-muted h-[250px] flex items-center justify-center">
              <p className="text-muted-foreground">300x250 인라인 광고</p>
            </div>
          </div>

          {/* AI 추천 콘텐츠 */}
          <AIContentRecommendations
            currentPostSlug={post.slug}
            currentPostCategory={post.category}
            currentPostTags={post.tags || []}
          />

          {/* 댓글 시스템 */}
          <Comments category={params.category} postSlug={params.slug} />
        </article>

        {/* 관련 포스트 */}
        {relatedPosts.length > 0 && (
          <div className="max-w-3xl mx-auto mt-16">
            <h2 className="text-2xl font-bold mb-6">관련 포스트</h2>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
              {relatedPosts.map((relatedPost) => (
                <Link
                  key={relatedPost._id}
                  href={`/blog/${relatedPost.category.toLowerCase()}/${relatedPost.slug}`}
                  className="group"
                >
                  <div className="space-y-2">
                    <div className="relative aspect-video overflow-hidden rounded-lg">
                      <Image
                        src={relatedPost.image || "/placeholder.svg?height=150&width=300"}
                        alt={relatedPost.title}
                        width={300}
                        height={150}
                        className="object-cover transition-transform group-hover:scale-105"
                      />
                    </div>
                    <h3 className="font-medium group-hover:text-primary transition-colors line-clamp-2">
                      {relatedPost.title}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  )
}
