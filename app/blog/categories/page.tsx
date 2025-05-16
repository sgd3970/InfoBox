import { Suspense } from 'react';
import { CategoriesContent } from './client';

export const metadata = {
  title: '카테고리 - InfoBox',
  description: '모든 카테고리 목록을 확인하세요.',
};

export const dynamic = 'force-dynamic';

export default function CategoriesPage() {
  return (
    <Suspense fallback={<div>페이지 로딩 중...</div>}>
      <CategoriesContent />
    </Suspense>
  );
}
