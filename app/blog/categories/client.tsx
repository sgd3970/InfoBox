"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'
import type { Category } from '@/lib/models'

export function CategoriesContent() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCategories() {
      try {
        setLoading(true);
        const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/categories`);
        if (!res.ok) throw new Error('카테고리 데이터를 가져오는데 실패했습니다');
        const data = await res.json();
        setCategories(data);
      } catch (error) {
        console.error('카테고리 데이터 가져오기 오류:', error);
        setCategories([]); // 오류 발생 시 빈 배열로 설정하여 UI가 깨지지 않도록 처리
      } finally {
        setLoading(false);
      }
    }

    fetchCategories();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="text-center py-10">
        <p>카테고리가 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-6">카테고리</h1>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <Link key={category.slug} href={`/blog/${category.slug}`} className="block">
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle>{category.name}</CardTitle>
                {/* 카테고리 설명 및 포스트 수 표시 추가 */}
                {category.description && <CardDescription>{category.description}</CardDescription>}
              </CardHeader>
              <CardContent>
                {/* postCount가 있다면 표시 */}
                {'postCount' in category && category.postCount !== undefined && (
                    <p className="text-sm text-muted-foreground">포스트 수: {category.postCount}</p>
                )}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
} 