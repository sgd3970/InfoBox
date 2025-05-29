'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface Post {
  _id: string;
  title: string;
  slug: string;
  description: string;
  content: string;
  category: string;
  tags: { name: string; slug: string }[];
  published: boolean;
  date: string;
}

export default function EditPostPage({ params }: { params: { slug: string } }) {
  const router = useRouter();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // 태그 관련 상태
  const [tags, setTags] = useState<string[]>([]);
  const [tagSlugs, setTagSlugs] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [newTagSlug, setNewTagSlug] = useState('');

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await fetch(`/api/posts/${params.slug}`);
        if (!res.ok) throw new Error('포스트를 불러오는데 실패했습니다.');
        const data = await res.json();
        setPost(data);
        setTags(data.tags.map((tag: { name: string }) => tag.name));
        setTagSlugs(data.tags.map((tag: { slug: string }) => tag.slug));
      } catch (error) {
        console.error('포스트 불러오기 오류:', error);
        toast.error('포스트를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [params.slug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!post) return;

    setSaving(true);
    try {
      const formData = {
        ...post,
        tags: tags.map((name, index) => ({
          name,
          slug: tagSlugs[index] || name.toLowerCase().replace(/\s+/g, '-')
        }))
      };

      const res = await fetch(`/api/posts/${params.slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!res.ok) throw new Error('포스트 수정에 실패했습니다.');

      toast.success('포스트가 성공적으로 수정되었습니다.');
      router.push('/admin/posts');
    } catch (error) {
      console.error('포스트 수정 오류:', error);
      toast.error('포스트 수정에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>로딩 중...</div>;
  if (!post) return <div>포스트를 찾을 수 없습니다.</div>;

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-8">포스트 수정</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="title">제목</Label>
          <Input
            id="title"
            value={post.title}
            onChange={(e) => setPost({ ...post, title: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="slug">Slug</Label>
          <Input
            id="slug"
            value={post.slug}
            onChange={(e) => setPost({ ...post, slug: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">설명</Label>
          <Textarea
            id="description"
            value={post.description}
            onChange={(e) => setPost({ ...post, description: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="content">내용</Label>
          <Textarea
            id="content"
            value={post.content}
            onChange={(e) => setPost({ ...post, content: e.target.value })}
            required
            className="min-h-[300px]"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">카테고리</Label>
          <Input
            id="category"
            value={post.category}
            onChange={(e) => setPost({ ...post, category: e.target.value })}
            required
          />
        </div>

        {/* 태그 입력 필드 */}
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

        {/* 태그 slug 입력 필드 */}
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

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="published"
            checked={post.published}
            onChange={(e) => setPost({ ...post, published: e.target.checked })}
          />
          <Label htmlFor="published">발행</Label>
        </div>

        <div className="flex gap-4">
          <Button type="submit" disabled={saving}>
            {saving ? '저장 중...' : '저장'}
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
  );
} 