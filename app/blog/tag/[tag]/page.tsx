import Link from "next/link"
import Image from "next/image"
import { notFound } from "next/navigation"
import clientPromise from "@/lib/mongodb"
import type { Post } from "@/lib/models"

interface TagPageProps {
  params: {
    tag: string
  }
}

async function getTagPosts(tag: string): Promise<Post[]> {
  try {
    const client = await clientPromise
    const db = client.db()
    const posts = await db
      .collection("posts")
      .find({ tags: { $regex: new RegExp(`^${tag}$`, "i") } })
      .sort({ date: -1 })
      .toArray()

    return posts as Post[]
  } catch (error) {
    console.error("태그 포스트 가져오기 오류:", error)
    return []
  }
}

export async function generateMetadata({ params }: TagPageProps) {
  const tag = decodeURIComponent(params.tag)

  return {
    title: `${tag} | 태그`,
    description: `${tag} 태그의 모든 게시물을 확인하세요.`,
  }
}

export default async function TagPage({ params }: TagPageProps) {
  const tag = decodeURIComponent(params.tag)
  const posts = await getTagPosts(tag)

  if (posts.length === 0) {
    notFound()
  }

  return (
    <div className="container py-10">
      <div className="mb-8">
        <h1 className="text-4xl font-bold">#{tag}</h1>
        <p className="text-muted-foreground mt-2">{posts.length}개의 게시물이 있습니다.</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post) => (
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
    </div>
  )
}
