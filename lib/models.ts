import React from 'react';

// MongoDB 컬렉션에 대한 타입 정의
export interface User {
  _id?: string
  name: string
  email: string
  password?: string // 실제 앱에서는 해시된 비밀번호 저장
  image?: string
  role: "user" | "admin"
  createdAt: Date
  updatedAt: Date
}

export interface Post {
  _id?: string
  title: string
  description: string
  content: string
  date: string
  category: string | { name: string; slug: string }
  slug: string
  image?: string
  images?: string[]  // 추가: 본문 이미지 배열
  featuredImage?: string | null
  author?: string
  authorId?: string
  featured?: boolean
  views: number
  createdAt: Date
  updatedAt: Date
  tags?: Array<string | { name: string; slug: string }>
}

export interface Category {
  _id?: string
  name: string
  slug: string
  description?: string
  postCount: number
}

export interface Comment {
  _id?: string
  postId: string
  postSlug: string
  nickname: string
  password: string
  content: string
  isPrivate: boolean
  createdAt: Date
  updatedAt: Date
}

export interface PageView {
  _id?: string
  path: string
  date: string
  count: number
}

export interface Referrer {
  _id?: string
  source: string
  count: number
  date: string
}

export interface DeviceStats {
  _id?: string
  device: "desktop" | "mobile" | "tablet"
  count: number
  date: string
}

export interface Tag {
  name: string;
  slug: string;
}
