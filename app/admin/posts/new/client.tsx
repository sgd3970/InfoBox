"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"
import type { Category } from "@/lib/models"

interface AdminNewPostClientProps {
  initialCategories: Category[];
}

export default function AdminNewPostClient({ initialCategories }: AdminNewPostClientProps) {
  const [title, setTitle] = useState("")
  const [slug, setSlug] = useState("")
  const [description, setDescription] = useState("")
  const [content, setContent] = useState("")
  const [category, setCategory] = useState("")
  const [tags, setTags] = useState("")
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<Category[]>(initialCategories)
  const [categoriesLoading, setCategoriesLoading] = useState(false)

  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    if (!category) {
      toast({
        title: "포스트 생성 오류",
        description: "카테고리를 선택해주세요.",
        variant: "destructive",
      })
      setLoading(false)
      return
    }

    const postData = {
      title,
      slug,
      description,
      content,
      category,
      tags: tags.split(",").map(tag => tag.trim()).filter(tag => tag !== ""),
      date: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      featured: false,
    }

    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(postData),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || "포스트 생성에 실패했습니다.")
      }

      const result = await res.json()
      toast({
        title: "포스트 생성 성공",
        description: "새 포스트가 성공적으로 생성되었습니다.",
      })
      router.push(`/admin/posts`)
    } catch (error: any) {
      toast({
        title: "포스트 생성 오류",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    setSlug(newTitle.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""));
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">새 포스트 작성</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="title">제목</Label>
          <Input id="title" value={title} onChange={handleTitleChange} required />
        </div>
        <div>
          <Label htmlFor="slug">슬러그 (영문 소문자, 하이픈)</Label>
          <Input id="slug" value={slug} onChange={(e) => setSlug(e.target.value)} required pattern="^[a-z0-9-]+$" title="슬러그는 영문 소문자, 숫자, 하이픈만 포함해야 합니다." />
        </div>
        <div>
          <Label htmlFor="description">요약</Label>
          <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} required />
        </div>
        <div>
          <Label htmlFor="content">내용 (Markdown)</Label>
          <Textarea id="content" value={content} onChange={(e) => setContent(e.target.value)} rows={15} required />
        </div>
        <div>
          <Label htmlFor="category">카테고리</Label>
          <Select value={category} onValueChange={setCategory} disabled={categoriesLoading || loading}>
            <SelectTrigger id="category">
              <SelectValue placeholder="카테고리 선택" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.slug} value={cat.slug}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="tags">태그 (쉼표로 구분)</Label>
          <Input id="tags" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="예: react, nextjs, 개발" />
        </div>
        <Button type="submit" disabled={loading || categoriesLoading || !category}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          포스트 생성
        </Button>
      </form>
    </div>
  )
} 