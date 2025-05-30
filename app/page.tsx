import Link from "next/link"
import Image from "next/image"
import type { Post, Category } from "@/lib/models"
import { HomePageClient } from "./home-page-client"
import { Metadata } from "next"

async function getPosts(): Promise<Post[]> {
  try {
    const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://example.com'
    // API 라우트에서 최신 포스트 가져오기
    const res = await fetch(`${BASE_URL}/api/posts/latest`, {
      cache: 'no-store' // 캐시 비활성화하여 매번 새로운 응답 받기
    })
    
    if (!res.ok) {
      console.error("최신 포스트 API 호출 실패:", res.status)
      return []
    }
    
    // 응답을 한 번만 읽기
    const posts = await res.json()
    return posts as Post[]
  } catch (error) {
    console.error("최신 포스트 fetch 오류:", error)
    return []
  }
}

async function getCategories(): Promise<Category[]> {
  try {
    const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://example.com'
    // API 라우트에서 카테고리 가져오기
    const res = await fetch(`${BASE_URL}/api/categories`, {
      cache: 'no-store' // 캐시 비활성화하여 매번 새로운 응답 받기
    })

    if (!res.ok) {
        console.error("카테고리 API 호출 실패:", res.status)
        return []
    }

    // 응답을 한 번만 읽기
    const categories = await res.json()
    return categories as Category[]
  } catch (error) {
    console.error("카테고리 fetch 오류:", error)
    return []
  }
}

export default async function HomePage() {
  const latestPosts = await getPosts()
  const categories = await getCategories()

  return <HomePageClient latestPosts={latestPosts} categories={categories} />
}

export async function generateMetadata(): Promise<Metadata> {
  const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://example.com'

  return {
    title: "InfoBox - 최신 트렌드와 기술 소식",
    description: "최신 트렌드와 기술 소식을 한눈에 확인하세요.",
    openGraph: {
      title: "InfoBox - 최신 트렌드와 기술 소식",
      description: "최신 트렌드와 기술 소식을 한눈에 확인하세요.",
      type: "website",
      url: BASE_URL,
    },
    alternates: {
      canonical: BASE_URL,
    },
  }
}
