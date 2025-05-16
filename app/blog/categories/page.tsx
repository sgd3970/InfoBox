import Link from "next/link"

export const metadata = {
  title: "카테고리 | InfoBox",
  description: "InfoBox 블로그의 모든 카테고리를 확인하세요.",
}

async function getCategories() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/categories`, { next: { revalidate: 3600 } })
    if (!res.ok) throw new Error("카테고리를 가져오는데 실패했습니다")
    return await res.json()
  } catch (error) {
    console.error("카테고리 가져오기 오류:", error)
    return []
  }
}

export default async function CategoriesPage() {
  const categories = await getCategories()

  // 카테고리를 알파벳 순으로 정렬
  const sortedCategories = [...categories].sort((a, b) => a.name.localeCompare(b.name))

  return (
    <div className="container py-10">
      <h1 className="text-4xl font-bold mb-8">카테고리</h1>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedCategories.map((category) => (
          <Link
            key={category.slug}
            href={`/blog/category/${category.slug}`}
            className="group relative overflow-hidden rounded-lg bg-muted p-6 transition-colors hover:bg-muted/80"
          >
            <div className="flex flex-col justify-between h-full">
              <h2 className="text-2xl font-bold mb-2">{category.name}</h2>
              <p className="text-muted-foreground">{category.postCount}개의 포스트</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
