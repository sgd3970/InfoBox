"use client"

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { getCategories } from '@/lib/posts';

async function CategoriesList() {
  const categories = await getCategories();
  
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {categories.map((category) => (
        <Link
          key={category.slug}
          href={`/blog/category/${category.slug}`}
          className="p-4 border rounded-lg hover:bg-accent"
        >
          <h2 className="text-xl font-bold">{category.name}</h2>
          <p className="text-sm text-muted-foreground">
            {category.postCount}개의 포스트
          </p>
        </Link>
      ))}
    </div>
  );
}

export function CategoriesContent() {
  const searchParams = useSearchParams();
  
  return (
    <div className="container py-8">
      <h1 className="mb-8 text-3xl font-bold">카테고리</h1>
      <Suspense fallback={<div>카테고리 로딩 중...</div>}>
        <CategoriesList />
      </Suspense>
    </div>
  );
} 