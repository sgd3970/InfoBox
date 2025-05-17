'use server';

import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth'; // 프로젝트의 NextAuth.js 설정 파일 경로에 맞게 수정
import type React from 'react';

export async function AdminAuthCheck({ children }: { children: React.ReactNode }) {
  console.log('AdminAuthCheck: Checking authentication with getServerSession...');
  const session = await getServerSession(authOptions);

  // 세션이 없거나, 사용자 정보가 없거나, 사용자의 역할이 admin이 아닌 경우 리다이렉트
  if (!session || !session.user || (session.user as any).role !== 'admin') {
    console.log('AdminAuthCheck: Authentication failed, redirecting to /login');
    redirect('/login');
  }

  console.log('AdminAuthCheck: Authentication successful for admin user.');
  return <>{children}</>;
} 