import Link from "next/link"
import Image from "next/image"
import clientPromise from "@/lib/mongodb"
import type { Post, Category } from "@/lib/models"
import { getCategories } from "@/lib/posts"
import { HomePageClient } from "./home-page-client"

async function getPosts(): Promise<Post[]> {
  try {
    const client = await clientPromise
    const db = client.db()
    const posts = await db
      .collection("posts")
      .find({})
      .sort({ publishedAt: -1 })
      .limit(6)
      .toArray()
    return (posts as unknown) as Post[]
  } catch (error) {
    console.error("포스트 가져오기 오류:", error)
    return []
  }
}

export default async function HomePage() {
  const latestPosts = await getPosts()
  const categories = await getCategories()

  return <HomePageClient latestPosts={latestPosts} categories={categories} />
}
