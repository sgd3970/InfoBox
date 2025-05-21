import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function POST(request: Request) {
  try {
    const { slug } = await request.json();

    if (!slug) {
      return NextResponse.json({ message: 'Slug is required' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    // 조회수 증가
    const result = await db.collection('posts').updateOne(
      { slug },
      { $inc: { views: 1 } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ message: 'Post not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'View count updated successfully' });
  } catch (error) {
    console.error('Error updating view count:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
} 