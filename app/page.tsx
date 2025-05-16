import Link from "next/link"
import Image from "next/image"
import { AdBanner } from "@/components/ad-banner"
import clientPromise from "@/lib/mongodb"
import type { Post, Category } from "@/lib/models"

async function getPosts(): Promise<Post[]> {
  try {
    const client = await clientPromise
    const db = client.db()
    const posts = await db.collection("posts").find().sort({ date: -1 }).limit(6).toArray()

    return posts as Post[]
  } catch (error) {
    console.error("포스트 가져오기 오류:", error)
    return []
  }
}

async function getCategories(): Promise<Category[]> {
  try {
    const client = await clientPromise
    const db = client.db()
    const categories = await db.collection("categories").find().toArray()

    return categories as Category[]
  } catch (error) {
    console.error("카테고리 가져오기 오류:", error)
    return []
  }
}

export default async function HomePage() {
  // 최신 포스트 6개 가져오기
  const latestPosts = await getPosts()

  // 카테고리 가져오기
  const categories = await getCategories()

  return (
    <div className="container py-10">
      {/* 히어로 섹션 */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/20 via-primary/5 to-background mb-16">
        <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(to_bottom,white,transparent)]" />
        <div className="relative grid lg:grid-cols-2 gap-8 items-center p-8 lg:p-12">
          <div className="space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              최신 정보와 트렌드를 <br />
              <span className="text-primary">InfoBox</span>에서 만나보세요
            </h1>
            <p className="text-xl text-muted-foreground">
              기술, 디자인, 비즈니스 등 다양한 분야의 유용한 정보를 제공하는 블로그 플랫폼입니다.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/blog"
                className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                블로그 보기
              </Link>
              <Link
                href="/about"
                className="inline-flex h-11 items-center justify-center rounded-md border border-input bg-background px-8 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                소개 페이지
              </Link>
            </div>
          </div>
          <div className="relative aspect-square w-full max-w-md mx-auto lg:mx-0">
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-primary to-primary-foreground opacity-20 blur-3xl" />
            <Image
              src="/placeholder.svg?height=600&width=600"
              alt="InfoBox 로고"
              width={600}
              height={600}
              className="relative z-10"
              priority
            />
          </div>
        </div>
      </section>

      {/* 광고 배너 */}
      <div className="flex justify-center mb-16">
        <AdBanner size="leaderboard" showCloseButton />
      </div>

      {/* 최신 포스트 섹션 */}
      <section className="mb-16">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold">최신 포스트</h2>
          <Link href="/blog" className="text-primary hover:underline font-medium flex items-center gap-1">
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
            >
              <path d="m9 18 6-6-6-6" />
            </svg>
          </Link>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {latestPosts.map((post) => (
            <Link key={post.slug} href={`/blog/${post.category.toLowerCase()}/${post.slug}`} className="group">
              <div className="space-y-4">
                <div className="relative aspect-video overflow-hidden rounded-lg">
                  <Image
                    src={post.image || "/placeholder.svg?height=200&width=400"}
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
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 카테고리 섹션 */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold mb-8">카테고리</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category) => (
            <Link
              key={category.slug}
              href={`/blog/category/${category.slug.toLowerCase()}`}
              className="group relative overflow-hidden rounded-lg bg-muted p-6 transition-colors hover:bg-muted/80"
            >
              <div className="flex flex-col justify-between h-full">
                <h3 className="text-xl font-bold mb-2">{category.name}</h3>
                <p className="text-muted-foreground">{category.postCount}개의 포스트</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 광고 배너 */}
      <div className="flex justify-center mb-16">
        <AdBanner size="leaderboard" showCloseButton />
      </div>
    </div>
  )
}
