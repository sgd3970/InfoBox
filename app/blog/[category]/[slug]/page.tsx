export const dynamic = 'force-dynamic';

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
import { GoogleAd } from "@/components/GoogleAd"
import { ViewTracker } from "@/components/view-tracker"
import { MDXRemote } from 'next-mdx-remote/rsc';

interface PostPageProps {
  params: {
    category: string
    slug: string
  }
}

// API 라우트를 사용하여 단일 포스트를 가져오는 함수
async function getPost(slug: string): Promise<Post | null> {
  try {
    const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://example.com'
    const res = await fetch(`${BASE_URL}/api/posts/${slug}`, {});

    if (!res.ok) {
      console.error(`포스트 ${slug} API 호출 실패:`, res.status);
      if (res.status === 404) return null;
      throw new Error(`포스트 ${slug} API 호출 오류: ${res.status}`);
    }

    const post = await res.json();
    return post as Post;
  } catch (error) {
    console.error(`포스트 ${slug} fetch 오류:`, error);
    return null;
  }
}

// API 라우트를 사용하여 관련 포스트를 가져오는 함수
async function getRelatedPosts(currentSlug: string, category: string, limit = 3): Promise<Post[]> {
  try {
    const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://example.com'
    const res = await fetch(`${BASE_URL}/api/search?category=${encodeURIComponent(category)}&limit=${limit + 5}`, {});

    if (!res.ok) {
      console.error(`관련 포스트 API 호출 실패 (카테고리: ${category}):`, res.status);
      return [];
    }

    const searchResults = await res.json();
    const relatedPosts = (searchResults.results as Post[]).filter(post => post.slug !== currentSlug).slice(0, limit);

    return relatedPosts;
  } catch (error) {
    console.error(`관련 포스트 fetch 오류 (카테고리: ${category}):`, error);
    return [];
  }
}

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://example.com'
  const post = await getPost(params.slug)

  if (!post) {
    return {}
  }

  const ogUrl = new URL(`/api/og`, BASE_URL)
  ogUrl.searchParams.set("title", post.title)
  ogUrl.searchParams.set("category", post.category)

  return {
    title: post.title,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      url: `${BASE_URL}/blog/${params.category.toLowerCase()}/${params.slug}`,
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
      canonical: `${BASE_URL}/blog/${params.category.toLowerCase()}/${params.slug}`,
    },
  }
}

export default async function PostPage({ params }: PostPageProps) {
  const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://example.com'
  const post = await getPost(params.slug)

  if (!post) {
    notFound()
  }

  const postUrl = `${BASE_URL}/blog/${params.category}/${params.slug}`

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
          <GoogleAd slot="4632464247" className="h-auto max-h-[150px] max-w-[90%] lg:h-[150px] mx-auto" />

          {/* AI 콘텐츠 요약 */}
          <AIContentSummary content={post.description} />

          {/* 본문 내용 */}
          <div className="prose prose-lg dark:prose-invert max-w-none mt-8 [&_table]:w-full [&_table]:border-collapse [&_th]:bg-muted [&_th]:p-4 [&_th]:text-left [&_td]:p-4 [&_td]:border [&_th]:border [&_img]:my-8 [&_img]:rounded-lg [&_img]:shadow-md [&_h1]:text-4xl [&_h1]:font-bold [&_h1]:mb-6 [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:mt-8 [&_h2]:mb-4 [&_p]:my-4 [&_ul]:my-4 [&_ol]:my-4 [&_li]:my-2 [&_a]:text-primary [&_a]:underline [&_a]:hover:text-primary/80">
            <MDXRemote source={post.content} />
          </div>

          {/* AI 추천 콘텐츠 */}
          <AIContentRecommendations
            currentPostSlug={post.slug}
            currentPostCategory={post.category}
            currentPostTags={post.tags || []}
          />

          {/* 댓글 시스템 */}
          {post._id && (
            <Comments category={params.category} postId={post._id.toString()} />
          )}

          {/* 인라인 광고 */}
          <GoogleAd slot="4632464247" className="h-auto max-h-[150px] max-w-[90%] lg:h-[150px] mx-auto" />
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

        {/* 조회수 추적 컴포넌트 추가 */}
        <ViewTracker slug={params.slug} />
      </div>
    </>
  )
}
