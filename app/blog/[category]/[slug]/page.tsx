export const dynamic = 'force-dynamic';

import { notFound } from "next/navigation"
import Image from "next/image"
import type { Metadata } from "next"
import Link from "next/link"
import { Comments } from "@/components/comments"
// import { AIContentSummary } from "@/components/ai-content-summary"
import { AIContentRecommendations } from "@/components/ai-content-recommendations"
import { SocialShare } from "@/components/social-share"
import { SEOSchema } from "@/components/seo-schema"
import type { Post } from "@/lib/models"
import { GoogleAd } from "@/components/GoogleAd"
import { ViewTracker } from "@/components/view-tracker"
import { PostThumbnail } from "@/components/PostThumbnail"

interface PostPageProps {
  params: {
    category: string
    slug: string
  }
}

// HTML 엔티티를 디코딩하는 헬퍼 함수 (서버/클라이언트 모두 작동하도록 수정)
function decodeHtmlEntities(html: string): string {
  if (!html) return '';
  // 간단하게 주요 HTML 엔티티를 치환합니다. 필요한 경우 더 많은 엔티티를 추가하거나 라이브러리를 사용하세요.
  return html.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#039;/g, "'");
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

  return (
    <div className="container py-8">
      <AIContentRecommendations
        currentPostSlug={post.slug}
        currentPostCategory={post.category}
      />
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
            </div>
            <h1 className="text-4xl font-bold">{post.title}</h1>
          </div>
          <div className="flex items-center space-x-2 text-muted-foreground">
            <div className="flex items-center gap-1">
              <CalendarIcon className="w-4 h-4" />
              <time dateTime={post.date}>{format(new Date(post.date), 'MMMM d, yyyy')}</time>

          {/* AI 추천 콘텐츠 */}
          <AIContentRecommendations
            currentPostSlug={post.slug}
            currentPostCategory={post.category}

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
                      <PostThumbnail
                        src={relatedPost.featuredImage || relatedPost.image}
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
