'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'react-hot-toast';
import type { Post, Category } from '@/lib/models';
import Editor from '@/components/Editor';
import he from 'he';
import { cleanHtml } from '@/lib/utils';

interface PostEditClientProps {
  initialPost: Post;
}

export default function PostEditClient({ initialPost }: PostEditClientProps) {
  const router = useRouter();
  const [post, setPost] = useState<Post>(initialPost);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [featuredImage, setFeaturedImage] = useState<string | null>(null);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [uploadedImageUrls, setUploadedImageUrls] = useState<string[]>([]);
  const [featuredImageUrl, setFeaturedImageUrl] = useState<string | null>(null);

  // 태그 관련 상태
  const [tags, setTags] = useState<{ name: string; slug: string }[]>([]);
  const [newTagName, setNewTagName] = useState('');
  const [newTagSlug, setNewTagSlug] = useState('');

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
    // 초기 태그 데이터 설정
    if (initialPost.tags) {
      setTags(initialPost.tags.map((tag: string | { name: string; slug: string }) => {
        if (typeof tag === 'string') {
          return { name: tag, slug: tag.toLowerCase().replace(/\s+/g, '-') };
        }
        return tag;
      }));
    }
  }, [initialPost]);

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

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const base64Images = await Promise.all(files.map(fileToBase64));
      setImages(base64Images as any);
      setPost(post => ({ ...post, images: base64Images as any }));
    }
  };

  const handleFeaturedImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const base64 = await fileToBase64(file);
      setFeaturedImage(base64 as any);
      setPost(post => ({ ...post, featuredImage: base64 as any }));
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

    const postData = {
      ...post,
      content: cleanHtml(he.decode(post.content)),
      images: post.images,
      featuredImage: post.featuredImage,
      updatedAt: new Date().toISOString(),
      tags: tags // 태그 데이터 업데이트
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
          <Editor
            value={post.content || ''}
            onChange={(newContent) => {
              const cleanedContent = newContent.replace(/<p><br><\/p>/g, '')
              setPost(post => ({ ...post, content: cleanedContent }))
            }}
          />
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

        {/* 태그 입력 필드 */}
        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-700">태그</label>
          <div className="space-y-2">
            {tags.map((tag, index) => (
              <div key={index} className="flex items-center gap-2 bg-secondary px-3 py-1 rounded-full">
                <span>{tag.name}</span>
                <span className="text-muted-foreground">({tag.slug})</span>
                <button
                  type="button"
                  onClick={() => setTags(tags.filter((_, i) => i !== index))}
                  className="text-muted-foreground hover:text-foreground"
                >
                  ×
                </button>
              </div>
            ))}
            <div className="flex gap-2">
              <Input
                placeholder="태그 이름"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newTagName) {
                    e.preventDefault();
                    const slug = newTagSlug || newTagName.toLowerCase().replace(/\s+/g, '-');
                    setTags([...tags, { name: newTagName, slug }]);
                    setNewTagName('');
                    setNewTagSlug('');
                  }
                }}
              />
              <Input
                placeholder="태그 slug (선택사항)"
                value={newTagSlug}
                onChange={(e) => setNewTagSlug(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newTagName) {
                    e.preventDefault();
                    const slug = newTagSlug || newTagName.toLowerCase().replace(/\s+/g, '-');
                    setTags([...tags, { name: newTagName, slug }]);
                    setNewTagName('');
                    setNewTagSlug('');
                  }
                }}
              />
            </div>
            <p className="text-sm text-gray-500">
              태그 이름을 입력하고 Enter를 누르세요. Slug는 선택사항이며, 입력하지 않으면 태그 이름을 기반으로 자동 생성됩니다.
            </p>
          </div>
        </div>

        <Button type="submit" disabled={loading}>
          {loading ? '수정 중...' : '포스트 수정'}
        </Button>
      </form>
    </div>
  );
} 