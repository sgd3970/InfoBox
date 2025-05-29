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
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { cleanHtml } from '@/lib/utils';
import Editor from '@/components/Editor';
import he from 'he';
import { toast } from 'sonner';

interface AdminNewPostClientProps {}

export default function AdminNewPostClient({}: AdminNewPostClientProps) {
  const [title, setTitle] = useState("")
  const [slug, setSlug] = useState("")
  const [description, setDescription] = useState("")
  const [content, setContent] = useState("")
  const [category, setCategory] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [tagSlugs, setTagSlugs] = useState<string[]>([])
  const [newTag, setNewTag] = useState('')
  const [newTagSlug, setNewTagSlug] = useState('')
  const [images, setImages] = useState<string[]>([])
  const [featuredImage, setFeaturedImage] = useState<string | null>(null)
  const [isUploadingImages, setIsUploadingImages] = useState(false)
  const [uploadedImageUrls, setUploadedImageUrls] = useState<string[]>([])
  const [featuredImageUrl, setFeaturedImageUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [categoriesLoading, setCategoriesLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const router = useRouter()
  const { toast: useToastToast } = useToast()

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSaving(true)

    const formData = new FormData(e.currentTarget)
    const postData = {
      title: formData.get('title'),
      slug: formData.get('slug'),
      description: formData.get('description'),
      content: formData.get('content'),
      category: formData.get('category'),
      published: formData.get('published') === 'on',
      date: new Date().toISOString(),
      tags: tags.map((name, index) => ({
        name,
        slug: tagSlugs[index] || name.toLowerCase().replace(/\s+/g, '-')
      })),
      featured: false,
      images: images,
      featuredImage: featuredImage,
    }

    try {
      const BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';
      const res = await fetch(`${BASE_URL}/api/posts`, {
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

      toast.success("포스트가 성공적으로 생성되었습니다.")
      router.push(`/admin/posts`)
    } catch (error: any) {
      console.error('포스트 생성 오류:', error)
      toast.error("포스트 생성에 실패했습니다.")
    } finally {
      setSaving(false)
    }
  }

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    setSlug(newTitle.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""));
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const base64Images = await Promise.all(files.map(fileToBase64));
      setImages(base64Images as any); // images를 string[]로 사용
    }
  };

  const handleFeaturedImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const base64 = await fileToBase64(file);
      setFeaturedImage(base64 as any); // featuredImage를 string으로 사용
    }
  };

  const handleInsertImage = (url: string) => {
    const textarea = document.getElementById('content') as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const markdown = `\n![Alt Text](${url})\n`; // 마크다운 이미지 구문
      textarea.value = textarea.value.substring(0, start) + markdown + textarea.value.substring(end);
      setContent(textarea.value);
      textarea.focus();
      textarea.setSelectionRange(start + markdown.length, start + markdown.length);
    }
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setCategoriesLoading(true);
        const BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';
        const res = await fetch(`${BASE_URL}/api/categories`);
        if (!res.ok) {
          throw new Error('카테고리를 가져오는데 실패했습니다');
        }
        const data = await res.json();
        setCategories(data);
      } catch (error) {
        console.error('카테고리 가져오기 오류:', error);
        useToastToast({
          title: "오류",
          description: "카테고리를 불러오는데 실패했습니다.",
          variant: "destructive",
        });
      } finally {
        setCategoriesLoading(false);
      }
    };
    fetchCategories();
  }, []);

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-8">새 포스트 작성</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="title">제목</Label>
          <Input
            id="title"
            name="title"
            value={title}
            onChange={handleTitleChange}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="slug">Slug</Label>
          <Input
            id="slug"
            name="slug"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            required
            pattern="[a-zA-Z0-9-]+"
            title="슬러그는 영문 소문자, 숫자, 하이픈만 포함해야 합니다."
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">설명</Label>
          <Textarea
            id="description"
            name="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="content">내용</Label>
          <Editor
            value={content}
            onChange={(newContent) => {
              // 불필요한 <p> 태그 제거
              const cleanedContent = newContent.replace(/<p><br><\/p>/g, '')
              setContent(cleanedContent)
            }}
          />
        </div>

        <div className="space-y-2">
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

        <div className="space-y-2">
          <Label htmlFor="tags">태그</Label>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag, index) => (
              <div key={index} className="flex items-center gap-2 bg-secondary px-3 py-1 rounded-full">
                <span>{tag}</span>
                <button
                  type="button"
                  onClick={() => {
                    setTags(tags.filter((_, i) => i !== index));
                    setTagSlugs(tagSlugs.filter((_, i) => i !== index));
                  }}
                  className="text-muted-foreground hover:text-foreground"
                >
                  ×
                </button>
              </div>
            ))}
            <input
              type="text"
              id="tags"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && newTag) {
                  e.preventDefault();
                  setTags([...tags, newTag]);
                  setNewTag('');
                }
              }}
              placeholder="태그 입력 후 Enter"
              className="flex-1 min-w-[200px] bg-transparent border-none focus:outline-none"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="tagSlugs">태그 Slug</Label>
          <div className="flex flex-wrap gap-2">
            {tagSlugs.map((slug, index) => (
              <div key={index} className="flex items-center gap-2 bg-secondary px-3 py-1 rounded-full">
                <span>{slug}</span>
                <button
                  type="button"
                  onClick={() => {
                    setTagSlugs(tagSlugs.filter((_, i) => i !== index));
                    setTags(tags.filter((_, i) => i !== index));
                  }}
                  className="text-muted-foreground hover:text-foreground"
                >
                  ×
                </button>
              </div>
            ))}
            <input
              type="text"
              id="tagSlugs"
              value={newTagSlug}
              onChange={(e) => setNewTagSlug(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && newTagSlug) {
                  e.preventDefault();
                  setTagSlugs([...tagSlugs, newTagSlug]);
                  setNewTagSlug('');
                }
              }}
              placeholder="태그 slug 입력 후 Enter"
              className="flex-1 min-w-[200px] bg-transparent border-none focus:outline-none"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="images">본문 이미지</Label>
          <Input id="images" type="file" multiple onChange={handleImageChange} accept="image/*" />
          <p className="text-sm text-muted-foreground mt-1">여러 개의 이미지를 선택할 수 있습니다.</p>
        </div>

        {images.length > 0 && (
          <div>
            <h4 className="text-md font-medium mb-2">선택된 본문 이미지 ({images.length}개)</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {images.map((url, index) => (
                <div key={index} className="border rounded-md p-2 flex flex-col items-center">
                  <img src={url} alt={`Preview ${index}`} className="w-full h-auto object-cover mb-2 rounded-md" />
                  <Button variant="outline" size="sm" onClick={() => handleInsertImage(url)} className="w-full">
                    본문에 삽입
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="featuredImage">대표 이미지</Label>
          <Input id="featuredImage" type="file" onChange={handleFeaturedImageChange} accept="image/*" />
          <p className="text-sm text-muted-foreground mt-1">포스트 카드에 사용될 대표 이미지를 선택하세요 (선택 사항).</p>
        </div>

        {featuredImage && (
          <div>
            <h4 className="text-md font-medium mb-2">선택된 대표 이미지</h4>
            <div className="border rounded-md p-2 flex flex-col items-center max-w-[300px]">
              <img src={featuredImage} alt="Featured Image Preview" className="w-full h-auto object-cover mb-2 rounded-md" />
            </div>
          </div>
        )}

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="published"
            name="published"
          />
          <Label htmlFor="published">발행</Label>
        </div>

        <div className="flex gap-4">
          <Button type="submit" disabled={saving || categoriesLoading || !category || isUploadingImages}>
            {saving || isUploadingImages ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            {isUploadingImages ? "이미지 업로드 중..." : "저장"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/admin/posts')}
          >
            취소
          </Button>
        </div>
      </form>
    </div>
  )
} 