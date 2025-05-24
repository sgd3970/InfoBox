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
import dynamic from 'next/dynamic'

// ReactQuill 에디터를 클라이언트 사이드에서만 로드
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false })
import 'react-quill/dist/quill.snow.css'

interface AdminNewPostClientProps {}

export default function AdminNewPostClient({}: AdminNewPostClientProps) {
  const [title, setTitle] = useState("")
  const [slug, setSlug] = useState("")
  const [category, setCategory] = useState("")
  const [description, setDescription] = useState("")
  const [content, setContent] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [images, setImages] = useState<File[]>([]) // 본문 이미지 파일 목록
  const [featuredImage, setFeaturedImage] = useState<File | null>(null) // 대표 이미지 파일
  const [isUploadingImages, setIsUploadingImages] = useState(false) // 이미지 업로드 중 상태
  const [uploadedImageUrls, setUploadedImageUrls] = useState<string[]>([]) // 업로드된 본문 이미지 URL 목록
  const [featuredImageUrl, setFeaturedImageUrl] = useState<string | null>(null) // 업로드된 대표 이미지 URL
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [categoriesLoading, setCategoriesLoading] = useState(true)

  const router = useRouter()
  const { toast } = useToast()

  // ReactQuill 에디터 설정
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'color': [] }, { 'background': [] }],
      ['link', 'image'],
      ['clean']
    ],
  }

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet',
    'color', 'background',
    'link', 'image'
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !slug || !category) {
      toast.error("제목, 슬러그, 카테고리는 필수 입력 항목입니다.")
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          slug,
          category,
          description,
          content,
          tags,
          image: featuredImageUrl,
          date: new Date().toISOString(),
        }),
      })

      if (!response.ok) {
        throw new Error("포스트 생성 실패")
      }

      toast.success("포스트가 생성되었습니다.")
      router.push("/admin/posts")
    } catch (error) {
      console.error("포스트 생성 오류:", error)
      toast.error("포스트 생성 중 오류가 발생했습니다.")
    } finally {
      setLoading(false)
    }
  }

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    setSlug(newTitle.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImages(Array.from(e.target.files));
    }
  };

  const handleFeaturedImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFeaturedImage(e.target.files[0]);
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

  const handleCategoryChange = (selectedCategory: string) => {
    setCategory(selectedCategory);
  }

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
        toast({
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
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">새 포스트 작성</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="title">제목</Label>
          <Input id="title" value={title} onChange={handleTitleChange} required />
        </div>
        <div>
          <Label htmlFor="slug">슬러그 (영문 소문자, 하이픈)</Label>
          <Input 
            id="slug" 
            value={slug} 
            onChange={(e) => setSlug(e.target.value)} 
            required 
            pattern="[a-zA-Z0-9-]+"
            title="슬러그는 영문 소문자, 숫자, 하이픈만 포함해야 합니다." 
          />
        </div>
        <div>
          <Label htmlFor="description">요약</Label>
          <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} required />
        </div>
        <div>
          <Label htmlFor="content">내용 (HTML)</Label>
          <div className="mt-2">
            <ReactQuill
              theme="snow"
              value={content}
              onChange={setContent}
              modules={modules}
              formats={formats}
              className="h-[400px] mb-12"
            />
          </div>
        </div>

        {/* 이미지 업로드 섹션 */}
        <Card>
          <CardHeader>
            <CardTitle>이미지 관리</CardTitle>
            <CardDescription>포스트에 사용할 이미지를 업로드하고 본문에 삽입하세요.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 본문 이미지 업로드 */}
            <div>
              <Label htmlFor="images">본문 이미지</Label>
              <Input id="images" type="file" multiple onChange={handleImageChange} accept="image/*" />
              <p className="text-sm text-muted-foreground mt-1">여러 개의 이미지를 선택할 수 있습니다.</p>
            </div>

            {/* 본문 이미지 미리보기 */}
            {images.length > 0 && (
              <div>
                <h4 className="text-md font-medium mb-2">선택된 본문 이미지 ({images.length}개)</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {images.map((file, index) => (
                    <div key={index} className="border rounded-md p-2 flex flex-col items-center">
                      <img src={URL.createObjectURL(file)} alt={`Preview ${index}`} className="w-full h-auto object-cover mb-2 rounded-md" />
                      <Button variant="outline" size="sm" onClick={() => handleInsertImage(URL.createObjectURL(file))} className="w-full">
                        본문에 삽입
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 대표 이미지 업로드 */}
            <div>
              <Label htmlFor="featuredImage">대표 이미지</Label>
              <Input id="featuredImage" type="file" onChange={handleFeaturedImageChange} accept="image/*" />
              <p className="text-sm text-muted-foreground mt-1">포스트 카드에 사용될 대표 이미지를 선택하세요 (선택 사항).</p>
            </div>

            {/* 대표 이미지 미리보기 */}
            {featuredImage && (
              <div>
                <h4 className="text-md font-medium mb-2">선택된 대표 이미지</h4>
                <div className="border rounded-md p-2 flex flex-col items-center max-w-[300px]">
                  <img src={URL.createObjectURL(featuredImage)} alt="Featured Image Preview" className="w-full h-auto object-cover mb-2 rounded-md" />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-2">
          <Label htmlFor="category">카테고리</Label>
          <Select
            value={category}
            onValueChange={handleCategoryChange}
            disabled={categoriesLoading}
          >
            <SelectTrigger>
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
          <Input id="tags" value={tags.join(",")} onChange={(e) => setTags(e.target.value.split(","))} placeholder="예: react, nextjs, 개발" />
        </div>
        <Button type="submit" disabled={loading || categoriesLoading || !category || isUploadingImages}>
          {loading ? "생성 중..." : "포스트 생성"}
        </Button>
      </form>
    </div>
  )
} 