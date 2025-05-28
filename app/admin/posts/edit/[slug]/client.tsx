'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'react-hot-toast';
import type { Post, Category } from '@/lib/models';
import dynamic from 'next/dynamic';
import '@toast-ui/editor/dist/toastui-editor.css';
import { Editor as ToastEditor } from '@toast-ui/react-editor';
// @ts-ignore
import sanitizeHtml from "sanitize-html";
import { cleanHtml } from '@/lib/utils';
import LexicalEditor from '@/components/LexicalEditor';

interface PostEditClientProps {
  initialPost: Post;
}

export default function PostEditClient({ initialPost }: PostEditClientProps) {
  const router = useRouter();
  const [post, setPost] = useState<Post>(initialPost);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [featuredImage, setFeaturedImage] = useState<File | null>(null);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [uploadedImageUrls, setUploadedImageUrls] = useState<string[]>([]);
  const [featuredImageUrl, setFeaturedImageUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';
        const res = await fetch(`${BASE_URL}/api/categories`);
        if (!res.ok) {
          throw new Error('카테고리를 가져오는데 실패했습니다');
        }
        const data = await res.json();
        setCategories(data);
      } catch (error) {
        console.error('카테고리 가져오기 오류:', error);
        toast.error('카테고리를 불러오는데 실패했습니다.');
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    if (editorRef.current) {
      (editorRef.current as any).getInstance().setHTML(initialPost.content || '');
    }
  }, [initialPost.content]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setPost({ ...post, [name]: value });
  };

  const handleSelectChange = (name: string, value: string) => {
    setPost({ ...post, [name]: value });
  };

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setPost({ ...post, [name]: checked });
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    if (!post.category) {
      toast.error("카테고리를 선택해주세요.");
      setLoading(false)
      return
    }

    setIsUploadingImages(true);
    let uploadedUrls: string[] = [];
    let uploadedFeaturedImageUrl: string | null = null;

    try {
      // 본문 이미지 업로드
      if (images.length > 0) {
        const formData = new FormData();
        images.forEach(file => formData.append('file', file));

        const BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';
        const uploadRes = await fetch(`${BASE_URL}/api/upload`, {
          method: 'POST',
          body: formData,
        });

        if (!uploadRes.ok) {
          const errorData = await uploadRes.json();
          throw new Error(errorData.error || '이미지 업로드에 실패했습니다.');
        }

        const result: { urls: string[], files: any[] } = await uploadRes.json();
        uploadedUrls = result.urls;
        setUploadedImageUrls(uploadedUrls);
      }

      // 대표 이미지 업로드
      if (featuredImage) {
        const formData = new FormData();
        formData.append('file', featuredImage);

        const BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';
        const uploadRes = await fetch(`${BASE_URL}/api/upload`, {
          method: 'POST',
          body: formData,
        });

        if (!uploadRes.ok) {
          const errorData = await uploadRes.json();
          throw new Error(errorData.error || '대표 이미지 업로드에 실패했습니다.');
        }

        const result: { url: string } = await uploadRes.json();
        uploadedFeaturedImageUrl = result.url;
        setFeaturedImageUrl(uploadedFeaturedImageUrl);
      }

    } catch (error: any) {
      setIsUploadingImages(false);
      setLoading(false);
      toast.error(error.message);
      return;
    } finally {
      setIsUploadingImages(false);
    }

    const html = (editorRef.current as any).getInstance().getHTML();
    const cleanedHtml = cleanHtml(html);
    const postData = {
      ...post,
      content: cleanedHtml,
      images: uploadedUrls.length > 0 ? uploadedUrls : post.images,
      featuredImage: uploadedFeaturedImageUrl || post.featuredImage,
      updatedAt: new Date().toISOString(),
    }

    try {
      const BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';
      const res = await fetch(`${BASE_URL}/api/posts/${post.slug}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(postData),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || "포스트 수정에 실패했습니다.")
      }

      toast.success("포스트가 성공적으로 수정되었습니다.")
      router.push(`/admin/posts`)
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-6">포스트 수정</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">제목</label>
          <Input id="title" name="title" value={post.title} onChange={handleChange} required />
        </div>
        <div>
          <label htmlFor="slug" className="block text-sm font-medium text-gray-700">슬러그</label>
          <Input id="slug" name="slug" value={post.slug} onChange={handleChange} required />
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">설명</label>
          <Textarea id="description" name="description" value={post.description} onChange={handleChange} required />
        </div>
        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700">내용 (HTML)</label>
          <LexicalEditor onHtmlChange={html => setPost(post => ({ ...post, content: html }))} />
        </div>
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700">카테고리</label>
          <Select name="category" value={post.category} onValueChange={(value) => handleSelectChange('category', value)}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="카테고리 선택" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category._id} value={category.name}>{category.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label htmlFor="tags" className="block text-sm font-medium text-gray-700">태그 (쉼표로 구분)</label>
          <Input id="tags" name="tags" value={post.tags?.join(', ') || ''} onChange={(e) => setPost({ ...post, tags: e.target.value.split(',').map(tag => tag.trim()) })} />
        </div>
        <div>
          <label htmlFor="image" className="block text-sm font-medium text-gray-700">이미지 URL</label>
          <Input id="image" name="image" value={post.image || ''} onChange={handleChange} />
        </div>

        {/* 대표 이미지 업로드 섹션 */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">대표 이미지</label>
            <div className="mt-2">
              {post.featuredImage && (
                <div className="mb-4">
                  <p className="text-sm text-gray-500 mb-2">현재 대표 이미지:</p>
                  <img 
                    src={post.featuredImage} 
                    alt="현재 대표 이미지" 
                    className="max-w-xs rounded-lg shadow-sm"
                  />
                </div>
              )}
              <Input
                type="file"
                accept="image/*"
                onChange={handleFeaturedImageChange}
                className="cursor-pointer"
              />
              <p className="mt-1 text-sm text-gray-500">
                새로운 대표 이미지를 선택하세요. 선택하지 않으면 기존 이미지가 유지됩니다.
              </p>
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700">날짜</label>
          <Input id="date" name="date" type="date" value={post.date ? new Date(post.date).toISOString().split('T')[0] : ''} onChange={handleChange} />
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox id="featured" name="featured" checked={post.featured || false} onCheckedChange={(checked) => handleCheckboxChange('featured', !!checked)} />
          <label htmlFor="featured" className="text-sm font-medium leading-none">추천 포스트</label>
        </div>
        <Button type="submit" disabled={loading}>
          {loading ? '수정 중...' : '포스트 수정'}
        </Button>
      </form>
    </div>
  );
} 