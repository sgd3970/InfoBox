import { notFound } from 'next/navigation';
import { AdminAuthCheck } from '@/components/admin/admin-auth-check';
import PostEditClient from './client';
import type { Post } from '@/lib/models';
import { Metadata } from 'next';

interface PostEditPageProps {
  params: {
    slug: string;
  };
}

async function getPostBySlug(slug: string): Promise<Post | null> {
  console.log(`getPostBySlug: Attempting to fetch post with slug: ${slug}`);
  try {
    const res = await fetch(`/api/posts/${slug}`, {
      next: { revalidate: 0 }, // 관리자 페이지는 캐싱하지 않음
      cache: 'no-store'
    });

    if (!res.ok) {
      if (res.status === 404) {
        console.log(`getPostBySlug: No post found with slug: ${slug}`);
        return null;
      }
      console.error(`getPostBySlug API 호출 실패 (${slug}):`, res.status);
      return null; // API 호출 실패 시 null 반환
    }

    const post = await res.json();
     // _id가 ObjectId 형태로 넘어올 경우 문자열로 변환하여 클라이언트 컴포넌트에서 사용 가능하게 함
    if (post && post._id && typeof post._id !== 'string') {
        post._id = post._id.toString();
    }

    console.log(`getPostBySlug: Found post with slug: ${slug}`);
    return post as Post | null;

  } catch (error) {
    console.error('getPostBySlug fetch 오류:', error);
    return null;
  }
}

export default async function PostEditPage({ params }: PostEditPageProps) {
  const initialPost = await getPostBySlug(params.slug);

  if (!initialPost) {
    notFound();
  }

  return (
    <AdminAuthCheck>
      <PostEditClient initialPost={initialPost} />
    </AdminAuthCheck>
  );
}

export async function generateMetadata({ params }: PostEditPageProps): Promise<Metadata> {
  const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://example.com'
  const post = await getPostBySlug(params.slug)

  if (!post) {
    return {
      title: "포스트 수정 - 트렌드 스캐너",
      description: "트렌드 스캐너 포스트를 수정하세요.",
    }
  }

  return {
    title: `${post.title} 수정 - 트렌드 스캐너`,
    description: `${post.title} 포스트를 수정하세요.`,
    openGraph: {
      title: `${post.title} 수정 - 트렌드 스캐너`,
      description: `${post.title} 포스트를 수정하세요.`,
      type: "website",
      url: `${BASE_URL}/admin/posts/edit/${params.slug}`,
    },
    alternates: {
      canonical: `${BASE_URL}/admin/posts/edit/${params.slug}`,
    },
  }
} 