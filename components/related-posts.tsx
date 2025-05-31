import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface Post {
  title: string
  description: string
  slug: string
  category: string
}

interface RelatedPostsProps {
  posts: Post[]
}

export function RelatedPosts({ posts }: RelatedPostsProps) {
  if (!posts.length) return null

  return (
    <div className="mt-12">
      <h2 className="mb-4 text-2xl font-bold">관련 포스트</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <Card key={post.slug} className="overflow-hidden">
            <CardHeader className="p-4">
              <CardTitle className="line-clamp-1 text-lg">
                <Link 
                  href={`/blog/${typeof post.category === 'string' ? post.category.toLowerCase() : post.category?.slug.toLowerCase()}/${post.slug}`} 
                  className="hover:underline"
                >
                  {post.title}
                </Link>
              </CardTitle>
              <CardDescription className="line-clamp-2">{post.description}</CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <Link
                href={`/blog/${typeof post.category === 'string' ? post.category.toLowerCase() : post.category?.slug.toLowerCase()}/${post.slug}`}
                className="block"
              >
                자세히 보기
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
