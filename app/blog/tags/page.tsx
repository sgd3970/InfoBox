import { Suspense } from "react"
import TagsClient, { type TagData } from "./client"
import type { Post } from "@/lib/models"
import { Metadata } from "next"

export const dynamic = "force-dynamic"

export async function generateMetadata(): Promise<Metadata> {
  const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://example.com'

  return {
    title: "태그 - 트렌드 스캐너",
    description: "모든 태그 목록을 확인하세요.",
    openGraph: {
      title: "태그 - 트렌드 스캐너",
      description: "모든 태그 목록을 확인하세요.",
      type: "website",
      url: `${BASE_URL}/blog/tags`,
    },
    alternates: {
      canonical: `${BASE_URL}/blog/tags`,
    },
  }
}

export default async function TagsPage() {
  // 태그 목록을 tags 컬렉션에서 가져오기
  let tagsData: TagData[] = [];
  try {
    const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://example.com'
    const url = new URL('/api/tags', BASE_URL).toString()
    const tagsRes = await fetch(url, {})
    if (tagsRes.ok) {
      const tagsCollectionData = await tagsRes.json();
      // tags 컬렉션에서 가져온 데이터를 TagData 형식으로 변환
      // tags 컬렉션의 각 문서는 { name: string, slug: string, postCount: number } 형태일 것으로 예상
      // TagData는 { tag: string, count: number, maxCount: number } 형태
      const maxCount = Math.max(...tagsCollectionData.map((tag: any) => tag.postCount), 1); // 최소 maxCount는 1
      tagsData = tagsCollectionData.map((tag: any) => ({
        tag: tag.name, // name 필드를 tag 이름으로 사용
        count: tag.postCount,
        maxCount: maxCount,
      })).sort((a: TagData, b: TagData) => a.tag.localeCompare(b.tag)); // 태그 이름으로 정렬
    } else {
      console.error("태그 목록 가져오기 실패", tagsRes.status);
    }
  } catch (error) {
    console.error("태그 목록 가져오는 중 오류 발생:", error);
    tagsData = [];
  }

  return (
    <div className="container py-10">
      <h1 className="text-4xl font-bold mb-8">태그</h1>

      <Suspense
        fallback={
          <div className="flex flex-wrap gap-4">
            {Array.from({ length: 20 }).map((_, i) => (
              <div key={i} className="h-10 w-24 rounded-full bg-muted animate-pulse" />
            ))}
          </div>
        }
      >
        <TagsClient tags={tagsData} />
      </Suspense>
    </div>
  )
}
