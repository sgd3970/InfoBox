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
import dynamic from 'next/dynamic';

// ReactQuill 에디터를 클라이언트 사이드에서만 로드
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false })
import 'react-quill/dist/quill.snow.css'

interface PostEditClientProps {
  initialPost: Post;
}

export default function PostEditClient({ initialPost }: PostEditClientProps) {
  const router = useRouter();
  const [post, setPost] = useState<Post>(initialPost);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`/api/posts/${post.slug}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(post),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || '포스트 수정에 실패했습니다.');
      }

      toast.success('포스트가 성공적으로 수정되었습니다.');
      router.push('/admin/posts');
    } catch (error: any) {
      console.error('포스트 수정 오류:', error);
      toast.error(error.message || '포스트 수정 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

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
          <div className="mt-2">
            <ReactQuill
              theme="snow"
              value={post.content}
              onChange={(content) => setPost({ ...post, content })}
              modules={modules}
              formats={formats}
              className="h-[400px] mb-12"
            />
          </div>
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