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

const commentFormSchema = z.object({
  nickname: z.string().min(2, { message: "닉네임은 2자 이상이어야 합니다." }),
  password: z.string().length(4, { message: "비밀번호는 4자리 숫자여야 합니다." }).regex(/^\d+$/, { message: "비밀번호는 숫자만 입력 가능합니다." }),
  content: z.string(),
})

type CommentFormValues = z.infer<typeof commentFormSchema>

interface Comment {
  _id: string
  nickname: string
  content: string
  createdAt: string
  postSlug: string
}

interface CommentsProps {
  postSlug: string
  category: string
}

export function Comments({ postSlug, category }: CommentsProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

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
        const response = await fetch(`/api/comments?postSlug=${postSlug}`)
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
  }, [postSlug])

  async function onSubmit(data: CommentFormValues) {
    setIsSubmitting(true)
    try {
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nickname: data.nickname,
          password: data.password,
          content: data.content,
          postSlug,
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

  const handleDeleteComment = async (commentId: string) => {
    const password = prompt("댓글 삭제를 위해 비밀번호를 입력하세요:");
    if (!password) return;

    if (password.length !== 4 || !/^[0-9]+$/.test(password)) {
        alert("비밀번호는 4자리 숫자여야 합니다.");
        return;
    }

    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      });

      if (!response.ok) throw new Error("댓글 삭제에 실패했습니다.");

      setComments((prev) => prev.filter(comment => comment._id !== commentId));
      alert("댓글이 삭제되었습니다.");

    } catch (error) {
      console.error("댓글 삭제 오류:", error);
      alert("댓글 삭제 중 오류가 발생했습니다.");
    }
  };

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
                      onClick={() => handleDeleteComment(comment._id)}
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
    </div>
  )
}
