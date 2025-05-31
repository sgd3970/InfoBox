"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Search, Edit, Eye, Trash, Loader2 } from "lucide-react"
import type { Post } from "@/lib/models"
import { useRouter } from "next/navigation"
import { toast } from "react-hot-toast"

export default function AdminPostsClient() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  const fetchPosts = async () => {
    try {
      const BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';
      const res = await fetch(`${BASE_URL}/api/posts`, { 
        credentials: "include",
        cache: 'no-store'  // 캐시 비활성화
      });
      
      if (!res.ok) {
        throw new Error("포스트를 가져오는데 실패했습니다.")
      }
      
      const data = await res.json()
      setPosts(data)  // API는 posts 배열을 직접 반환하므로 data.posts가 아닌 data를 사용
    } catch (error) {
      console.error("포스트 가져오기 오류:", error)
      toast.error("포스트를 불러오는데 실패했습니다.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPosts()
  }, [])

  const handleDelete = async (slug: string) => {
    if (!confirm("정말로 이 포스트를 삭제하시겠습니까?")) {
      return
    }

    try {
      const BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';
      const res = await fetch(`${BASE_URL}/api/posts/${slug}`, { 
        method: "DELETE", 
        credentials: "include" 
      });

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || "포스트 삭제에 실패했습니다.")
      }

      toast.success("포스트가 성공적으로 삭제되었습니다.")
      fetchPosts() // 목록 새로고침
    } catch (error: any) {
      console.error("포스트 삭제 오류:", error)
      toast.error(error.message || "포스트 삭제 중 오류가 발생했습니다.")
    }
  }

  // 검색 필터링
  const filteredPosts = posts?.filter((post) => {
    if (!post) return false; // post가 undefined인 경우 필터링에서 제외
    const searchContent =
      `${post.title} ${post.description} ${post.category} ${post.tags?.join(" ") || ""}`.toLowerCase()
    return searchContent.includes(searchTerm.toLowerCase())
  }) || [] // posts가 undefined인 경우 빈 배열 반환

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">포스트 관리</h2>
        <Button asChild>
          <Link href="/admin/posts/new">
            <Plus className="h-4 w-4 mr-2" />새 포스트
          </Link>
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="포스트 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>제목</TableHead>
              <TableHead>카테고리</TableHead>
              <TableHead>작성일</TableHead>
              <TableHead>작성자</TableHead>
              <TableHead>조회수</TableHead>
              <TableHead className="text-right">작업</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPosts.map((post) => (
              <TableRow key={post._id}>
                <TableCell className="font-medium">{post.title}</TableCell>
                <TableCell>{
                  typeof post.category === 'object' && post.category !== null && 'name' in post.category 
                    ? post.category.name 
                    : typeof post.category === 'string' 
                    ? post.category 
                    : JSON.stringify(post.category)
                }</TableCell>
                <TableCell>
                  {new Date(post.date).toLocaleDateString("ko-KR", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </TableCell>
                <TableCell>{post.author || "관리자"}</TableCell>
                <TableCell>{post.views.toLocaleString()}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" asChild>
                      <Link
                        href={`/blog/${typeof post.category === 'object' && post.category !== null && 'slug' in post.category ? post.category.slug : post.category?.toLowerCase() || 'uncategorized'}/${post.slug}`}
                        className="block"
                        rel="noopener noreferrer"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/admin/posts/edit/${post.slug}`}>
                        <Edit className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700" onClick={() => handleDelete(post.slug)}>
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filteredPosts.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4">
                  검색 결과가 없습니다.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
