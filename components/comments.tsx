"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { formatDistanceToNow } from "date-fns"
import { ko } from "date-fns/locale"
import { Checkbox } from "@/components/ui/checkbox"
import { Trash2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"

const commentFormSchema = z.object({
  nickname: z.string().min(2, { message: "닉네임은 2자 이상이어야 합니다." }),
  password: z.string().length(4, { message: "비밀번호는 4자리 숫자여야 합니다." }).regex(/^\d+$/, { message: "비밀번호는 숫자만 입력 가능합니다." }),
  content: z.string(),
})

type CommentFormValues = z.infer<typeof commentFormSchema>

interface Comment {
  _id: string
  postId: string
  nickname: string
  content: string
  createdAt: string
  isPrivate: boolean
}

interface CommentsProps {
  postId: string
  category: string
}

export function Comments({ postId, category }: CommentsProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
  const [commentToDelete, setCommentToDelete] = useState<string | null>(null)
  const [deletePassword, setDeletePassword] = useState("")
  const { toast } = useToast()

  const form = useForm<CommentFormValues>({
    resolver: zodResolver(commentFormSchema),
    defaultValues: {
      nickname: "",
      password: "",
      content: "",
    },
    mode: "onChange",
  })

  useEffect(() => {
    async function fetchComments() {
      try {
        const response = await fetch(`/api/comments?postId=${postId}`)
        if (!response.ok) throw new Error("댓글을 불러오는데 실패했습니다.")
        const data = await response.json()
        setComments(data)
      } catch (error) {
        console.error("댓글 불러오기 오류:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchComments()
  }, [postId])

  async function onSubmit(data: CommentFormValues) {
    setIsSubmitting(true)
    try {
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          postId,
          nickname: data.nickname,
          password: data.password,
          text: data.content,
          isPrivate: false,
        }),
      })

      if (!response.ok) throw new Error("댓글 작성에 실패했습니다.")

      const newComment = await response.json()
      setComments((prev) => [newComment, ...prev])
      form.reset()
    } catch (error) {
      console.error("댓글 작성 오류:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteClick = (commentId: string) => {
    setCommentToDelete(commentId)
    setDeleteDialogOpen(true)
  }

  const handlePasswordSubmit = () => {
    if (deletePassword.length !== 4) {
      toast({
        title: "비밀번호 오류",
        description: "비밀번호는 4자리 숫자여야 합니다.",
        variant: "destructive",
      })
      return
    }
    setDeleteDialogOpen(false)
    setConfirmDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!commentToDelete || !deletePassword) return

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/comments/${commentToDelete}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password: deletePassword }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "댓글 삭제에 실패했습니다.")
      }

      setComments((prev) => prev.filter((comment) => comment._id !== commentToDelete))
      toast({
        title: "댓글 삭제",
        description: "댓글이 성공적으로 삭제되었습니다.",
      })
    } catch (error) {
      console.error("댓글 삭제 오류:", error)
      toast({
        title: "댓글 삭제 실패",
        description: error instanceof Error ? error.message : "댓글 삭제 중 오류가 발생했습니다.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setConfirmDialogOpen(false)
      setCommentToDelete(null)
      setDeletePassword("")
    }
  }

  const handleCancel = () => {
    setDeleteDialogOpen(false)
    setConfirmDialogOpen(false)
    setCommentToDelete(null)
    setDeletePassword("")
  }

  return (
    <div className="mt-12">
      <h2 className="mb-6 text-2xl font-bold">댓글</h2>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>댓글 작성</CardTitle>
          <CardDescription>이 글에 대한 의견을 남겨주세요.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="nickname"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>닉네임</FormLabel>
                      <FormControl>
                        <Input placeholder="닉네임을 입력하세요" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>비밀번호 (4자리 숫자)</FormLabel>
                      <FormControl>
                        <Input 
                          type="password" 
                          placeholder="****" 
                          maxLength={4}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>댓글</FormLabel>
                    <FormControl>
                      <Textarea placeholder="댓글을 작성해주세요." rows={4} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "작성 중..." : "댓글 작성"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <h3 className="text-xl font-semibold">{comments.length}개의 댓글이 있습니다.</h3>

        {isLoading ? (
          <p>댓글을 불러오는 중...</p>
        ) : comments.length === 0 ? (
          <p>아직 댓글이 없습니다. 첫 번째 댓글을 작성해보세요!</p>
        ) : (
          comments.map((comment) => (
            <div key={comment._id} className="space-y-4">
              <div className="flex items-start gap-4">
                <Avatar>
                  <AvatarFallback>{comment.nickname ? comment.nickname.substring(0, 2).toUpperCase() : '?'}</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">{comment.nickname || '익명 사용자'}</h4>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(comment.createdAt), {
                        addSuffix: true,
                        locale: ko,
                      })}
                    </p>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => handleDeleteClick(comment._id)}
                      disabled={isDeleting}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-sm">{comment.content}</p>
                </div>
              </div>
              <Separator />
            </div>
          ))
        )}
      </div>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>댓글 삭제</DialogTitle>
            <DialogDescription>
              댓글을 삭제하려면 작성 시 입력한 비밀번호를 입력해주세요.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              type="password"
              placeholder="비밀번호 4자리"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              maxLength={4}
              disabled={isDeleting}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isDeleting}
            >
              취소
            </Button>
            <Button
              variant="destructive"
              onClick={handlePasswordSubmit}
              disabled={isDeleting || deletePassword.length !== 4}
            >
              다음
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>댓글 삭제 확인</DialogTitle>
            <DialogDescription>
              정말로 이 댓글을 삭제하시겠습니까?
              <br />
              삭제된 댓글은 복구할 수 없습니다.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isDeleting}
            >
              취소
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
            >
              {isDeleting ? "삭제 중..." : "삭제"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
