"use client"

import { useEffect } from 'react';

interface ViewTrackerProps {
  slug: string;
}

export function ViewTracker({ slug }: ViewTrackerProps) {
  useEffect(() => {
    // 조회수 증가 API 호출
    fetch(`/api/views/${slug}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ slug }),
    }).then(response => {
      if (!response.ok) {
        console.error('Failed to update view count', response.statusText);
      }
    }).catch(error => {
      console.error('Error calling view count API', error);
    });
  }, [slug]); // slug가 변경될 때마다 (페이지 이동 시) 실행

  return null; // 이 컴포넌트는 UI를 렌더링하지 않습니다.
} 