export const dynamic = 'force-dynamic';

import Link from "next/link"
import Image from "next/image"
import { notFound } from "next/navigation"
// import clientPromise from "@/lib/mongodb"; // 필요시 주석 해제
import type { Post } from "@/lib/models"

interface TagPageProps {
  params: {
    tag: string
  }
}

// TODO: 특정 태그에 해당하는 포스트를 가져오는 함수 구현 필요
async function getPostsByTag(tag: string): Promise<Post[]> {
  // 임시 데이터 반환 또는 API 호출 로직 구현
  console.log(`Fetching posts for tag: ${tag}`);
  // 예시: /api/search 엔드포인트를 사용하여 태그로 필터링
  try {
    const searchRes = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/search?tags=${encodeURIComponent(tag)}&limit=100`, {});
    if (searchRes.ok) {
      const searchData = await searchRes.json();
      return searchData.posts || [];
    } else {
      console.error("태그별 포스트 목록 가져오기 실패", searchRes.status);
      return [];
    }
  } catch (error) {
    console.error("태그별 포스트 목록 가져오는 중 오류 발생:", error);
    return [];
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
  const tag = decodeURIComponent(params.tag);
  const posts = await getPostsByTag(tag);

  // 특정 태그에 해당하는 게시물이 없을 경우 404 처리 (선택 사항)
  // if (posts.length === 0) {
  //   notFound();
  // }

  return (
    <div className="container py-10">
      <div className="mb-8">
        <h1 className="text-4xl font-bold">#{tag}</h1>
        <p className="text-muted-foreground mt-2">{posts.length}개의 게시물이 있습니다.</p>
      </div>

      {posts.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <Link key={post.slug} href={`/blog/${post.category.toLowerCase()}/${post.slug}`} className="group">
              <div className="space-y-4">
                <div className="relative aspect-video overflow-hidden rounded-lg">
                  <Image
                    src={post.image || "/placeholder.svg?height=200&width=400"}
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
        <div className="text-center text-muted-foreground">해당 태그의 게시물이 없습니다.</div>
      )}
    </div>
  )
}
