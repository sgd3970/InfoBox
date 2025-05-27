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
        const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/categories`);
        if (!res.ok) throw new Error('카테고리 데이터를 가져오는데 실패했습니다');
        const data = await res.json();
        setCategories(data);
      } catch (error) {
        console.error('카테고리 데이터 가져오기 오류:', error);
        setCategories([]);
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
    <div className="min-h-screen bg-background">
      <div className="container py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">
            카테고리
          </h1>
          <p className="text-muted-foreground text-lg">
            관심 있는 주제를 선택하여 관련 콘텐츠를 탐색하세요
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category, index) => (
            <Link 
              key={category.slug} 
              href={`/blog/category/${category.slug}`} 
              className="block transform transition-all duration-300 hover:scale-105"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <Card className="h-full bg-card hover:bg-accent/5 transition-all duration-300 hover:shadow-lg">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold">
                    {category.name}
                  </CardTitle>
                  {category.description && (
                    <CardDescription className="text-base mt-2">
                      {category.description}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  {'postCount' in category && category.postCount !== undefined && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <span className="text-sm font-medium">포스트 수:</span>
                      <span className="text-lg font-bold">{category.postCount}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
} 