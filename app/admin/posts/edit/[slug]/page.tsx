import { notFound } from 'next/navigation';
import { AdminAuthCheck } from '@/components/admin/admin-auth-check';
import PostEditClient from './client';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import type { Post } from '@/lib/models';

interface PostEditPageProps {
  params: {
    slug: string;
  };
}

async function getPostBySlug(slug: string): Promise<Post | null> {
  console.log(`getPostBySlug: Attempting to fetch post with slug: ${slug}`);
  try {
    const client = await clientPromise;
    const db = client.db();
    const post = await db.collection<Post>('posts').findOne({ slug });
    if (post) {
      console.log(`getPostBySlug: Found post with slug: ${slug}`);
    } else {
      console.log(`getPostBySlug: No post found with slug: ${slug}`);
    }
    return post;
  } catch (error) {
    console.error('getPostBySlug error:', error);
    return null;
  }
}

export default async function PostEditPage({ params }: PostEditPageProps) {
  const post = await getPostBySlug(params.slug);

  if (!post) {
    console.log(`PostEditPage: Post not found for slug: ${params.slug}, returning notFound()`);
    notFound();
  }

  console.log('PostEditPage: Rendering PostEditClient with post data.');
  return (
    <AdminAuthCheck>
      <PostEditClient initialPost={post} />
    </AdminAuthCheck>
  );
} 