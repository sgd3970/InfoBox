"use client"

import Link from "next/link"
import Image from "next/image"
import { useTheme } from "next-themes"
// import { AdBanner } from "@/components/ad-banner"
import { GoogleAd } from "@/components/GoogleAd"
import type { Post, Category } from "@/lib/models"
import { PostThumbnail } from "@/components/PostThumbnail"

interface HomePageClientProps {
  latestPosts: Post[]
  categories: Category[]
}

declare global {
  interface Window {
    adsbygoogle: any[]
  }
}

export function HomePageClient({ latestPosts, categories }: HomePageClientProps) {
  const { theme } = useTheme()

  return (
    <div className="container px-4 py-6 md:py-10">
      {/* 히어로 섹션 */}
      <section className="relative overflow-hidden rounded-2xl md:rounded-3xl bg-gradient-to-br from-primary/20 via-primary/5 to-background mb-8 md:mb-16">
        <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(to_bottom,white,transparent)]" />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-background/80" />
        <div className="relative grid lg:grid-cols-2 gap-6 md:gap-8 items-center p-6 md:p-8 lg:p-12">
          <div className="space-y-4 md:space-y-6 text-center lg:text-left">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight animate-fade-in">
              최신 정보와 트렌드를 <br className="hidden sm:block" />
              <span className="text-primary relative inline-block">
                InfoBox
                <span className="absolute -bottom-2 left-0 w-full h-1 bg-primary/20 rounded-full" />
              </span>
              에서 만나보세요
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground animate-fade-in delay-200">
              기술, 디자인, 비즈니스 등 다양한 분야의 유용한 정보를 제공하는 블로그 플랫폼입니다.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center lg:justify-start animate-fade-in delay-300">
              <Link
                href="/blog"
                className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-6 md:px-8 text-sm font-medium text-primary-foreground shadow transition-all hover:bg-primary/90 hover:scale-105 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                블로그 보기
              </Link>
              <Link
                href="/about"
                className="inline-flex h-11 items-center justify-center rounded-md border border-input bg-background px-6 md:px-8 text-sm font-medium shadow-sm transition-all hover:bg-accent hover:text-accent-foreground hover:scale-105 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                소개 페이지
              </Link>
            </div>
          </div>
          <div className="relative aspect-square w-full max-w-[300px] md:max-w-md mx-auto lg:mx-0">
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-primary to-primary-foreground opacity-20 blur-3xl animate-pulse" />
            <Image
              src={theme === 'dark' ? '/darkmode.png' : '/lightmode.png'}
              alt="InfoBox 로고"
              width={600}
              height={600}
              className="relative z-10 animate-float"
              priority
            />
          </div>
        </div>
      </section>

      {/* 최신 포스트 섹션 */}
      <section className="mb-8 md:mb-16">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 md:mb-8">
          <h2 className="text-2xl md:text-3xl font-bold relative">
            최신 포스트
            <span className="absolute -bottom-2 left-0 w-1/3 h-1 bg-primary/20 rounded-full" />
          </h2>
          <Link href="/blog" className="text-primary hover:text-primary/80 font-medium flex items-center gap-1 transition-colors">
            모두 보기
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="transition-transform group-hover:translate-x-1"
            >
              <path d="m9 18 6-6-6-6" />
            </svg>
          </Link>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {latestPosts.map((post, index) => (
            <>
              {index === 1 && (
                <div key="ad-container" className="container mx-auto px-4 group w-full min-w-0">
                  <div className="space-y-4 w-full">
                    <div className="relative overflow-hidden rounded-lg">
                      <GoogleAd slot="8571709253" className="h-auto min-h-[100px] lg:h-[150px] w-full" />
                    </div>
                  </div>
                </div>
              )}
              <Link
                key={post.slug}
                href={`/blog/${typeof post.category === 'string' ? post.category.toLowerCase() : post.category?.slug.toLowerCase()}/${post.slug}`}
                className="group rounded-lg bg-white dark:bg-zinc-900 shadow-sm hover:shadow-md transition-shadow border overflow-hidden flex flex-col min-w-0"
              >
                <div className="relative aspect-video w-full overflow-hidden">
                  <PostThumbnail
                    src={post.featuredImage || post.image || ''}
                    alt={post.title}
                    width={400}
                    height={200}
                    className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="flex-1 flex flex-col p-4 gap-2 min-w-0">
                  <span className="text-xs font-medium px-2 py-1 rounded-full bg-primary/10 text-primary w-fit">{
                    typeof post.category === 'object' && post.category !== null && 'name' in post.category 
                      ? post.category.name 
                      : typeof post.category === 'string' 
                      ? post.category 
                      : JSON.stringify(post.category)
                  }</span>
                  <h3 className="font-bold group-hover:text-primary transition-colors line-clamp-2 text-base md:text-lg">{post.title}</h3>
                  <p className="text-muted-foreground text-sm line-clamp-2 break-words min-w-0">{post.description}</p>
                  <div className="flex items-center text-xs text-muted-foreground mt-auto">
                    <time dateTime={new Date(post.date).toISOString()}>{new Date(post.date).toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" })}</time>
                  </div>
                </div>
              </Link>
            </>
          ))}
        </div>
      </section>

      {/* 카테고리 섹션 */}
      <section className="mb-8 md:mb-16">
        <h2 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8 relative">
          카테고리
          <span className="absolute -bottom-2 left-0 w-1/3 h-1 bg-primary/20 rounded-full" />
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {categories.map((category) => (
            <Link
              key={category.slug}
              href={`/blog/category/${category.slug}`}
              className="group relative overflow-hidden rounded-lg bg-muted p-4 md:p-6 transition-all hover:bg-muted/80 hover:scale-105"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative flex flex-col justify-between h-full">
                <h3 className="text-lg md:text-xl font-bold mb-2 group-hover:text-primary transition-colors">{category.name}</h3>
                <p className="text-sm md:text-base text-muted-foreground">{category.postCount}개의 포스트</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 광고 배너 */}
      <div className="container mx-auto px-4 flex justify-center mb-8 md:mb-16">
        <GoogleAd slot="8571709253" className="h-auto min-h-[100px] lg:h-[150px] w-full" />
      </div>

      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out forwards;
        }
        .delay-200 { animation-delay: 200ms; }
        .delay-300 { animation-delay: 300ms; }
      `}</style>
    </div>
  )
} 