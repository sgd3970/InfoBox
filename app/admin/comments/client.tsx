"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Eye, Trash, Loader2, Lock } from "lucide-react"
import type { Comment } from "@/lib/models"

export default function AdminCommentsClient() {
  const [searchTerm, setSearchTerm] = useState("")
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchComments() {
      try {
        setLoading(true)
        const res = await fetch("/api/comments/admin")
        if (!res.ok) throw new Error("댓글을 가져오는데 실패했습니다")
        const data = await res.json()
        setComments(data)
      } catch (error) {
        console.error("댓글 가져오기 오류:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchComments()
  }, [])

  // 검색 필터링
  const filteredComments = comments.filter((comment) => {
    const searchContent = `${comment.content} ${comment.nickname}`.toLowerCase()
    return searchContent.includes(searchTerm.toLowerCase())
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <Input
            placeholder="댓글 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>닉네임</TableHead>
              <TableHead>내용</TableHead>
              <TableHead>포스트</TableHead>
              <TableHead>작성일</TableHead>
              <TableHead className="text-right">작업</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredComments.map((comment) => (
              <TableRow key={comment._id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    {comment.nickname}
                    {comment.isPrivate && (
                      <Lock className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                </TableCell>
                <TableCell className="max-w-md truncate">{comment.content}</TableCell>
                <TableCell>
                  <Link
                    href={`/blog/${comment.postSlug}`}
                    className="text-primary hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    포스트 보기
                  </Link>
                </TableCell>
                <TableCell>
                  {new Date(comment.createdAt).toLocaleDateString("ko-KR", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" asChild>
                      <Link
                        href={`/blog/${comment.postSlug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-red-500 hover:text-red-700"
                      onClick={async () => {
                        if (window.confirm("이 댓글을 삭제하시겠습니까?")) {
                          try {
                            const res = await fetch(`/api/comments/admin?id=${comment._id}`, {
                              method: "DELETE",
                            })
                            if (!res.ok) throw new Error("댓글 삭제에 실패했습니다")
                            setComments(comments.filter((c) => c._id !== comment._id))
                          } catch (error) {
                            console.error("댓글 삭제 오류:", error)
                            alert("댓글 삭제에 실패했습니다")
                          }
                        }
                      }}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filteredComments.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4">
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