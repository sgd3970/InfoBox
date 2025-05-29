import { Suspense } from "react"
import TagsClient, { type TagData } from "./client"
import { getDatabase } from "@/lib/mongodb"
import type { Tag } from "@/lib/models"
import { Metadata } from "next"

export const dynamic = "force-dynamic"

export async function generateMetadata(): Promise<Metadata> {
  const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://example.com'

  return {
    title: "태그 - InfoBox",
    description: "모든 태그 목록을 확인하세요.",
    openGraph: {
      title: "태그 - InfoBox",
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
  // DB에서 모든 태그와 포스트를 불러옴
  const db = await getDatabase();
  const allTags = (await db.collection("tags").find({}).toArray()).map((tag: any) => ({
    name: tag.name,
    slug: tag.slug,
    postCount: tag.postCount ?? 0,
  })) as Tag[];
  const allPosts = await db.collection("posts").find({}).toArray();

  // 태그별로 posts에서 몇 번 등장하는지 count
  const tagCounts = allTags.map(tag => {
    const count = allPosts.filter(post => (post.tags || []).includes(tag.name)).length;
    return {
      name: tag.name,
      slug: tag.slug,
      count,
    };
  });

  // 0개인 태그는 제외
  const filteredTagCounts = tagCounts.filter(t => t.count > 0);

  // 알파벳 순 정렬
  const sortedTags = filteredTagCounts.sort((a, b) => a.name.localeCompare(b.name));

  // 최대 빈도수 계산
  const maxCount = Math.max(1, ...sortedTags.map(t => t.count));

  // 클라이언트 컴포넌트에 전달할 데이터 준비
  const tagsData: TagData[] = sortedTags.map(({ name, slug, count }) => ({
    tag: name,
    slug,
    count,
    maxCount,
  }));

  return (
    <div className="container py-10">
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
