"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Search, Edit, Trash, Loader2, Pencil } from "lucide-react"
import type { Category } from "@/lib/models"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"

export default function AdminCategoriesClient() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [newCategoryName, setNewCategoryName] = useState("")
  const [newCategorySlug, setNewCategorySlug] = useState("")
  const [newCategoryDescription, setNewCategoryDescription] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [editedCategoryData, setEditedCategoryData] = useState<Partial<Category>>({})
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  const { toast } = useToast()
  const router = useRouter()

  const fetchCategories = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/categories`)
      if (!res.ok) throw new Error("카테고리 데이터를 가져오는데 실패했습니다")
      const data = await res.json()
      setCategories(data)
    } catch (err) {
      console.error("카테고리 데이터 가져오기 오류:", err)
      setError("카테고리를 불러오는데 실패했습니다.")
      setCategories([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  const handleCreateCategory = async () => {
    if (!newCategoryName || !newCategorySlug) {
      toast({
        title: "오류",
        description: "카테고리 이름과 슬러그는 필수입니다.",
        variant: "destructive",
      })
      return
    }

    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newCategoryName,
          slug: newCategorySlug,
          description: newCategoryDescription,
        }),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || "카테고리 생성에 실패했습니다")
      }

      toast({
        title: "성공",
        description: "카테고리가 생성되었습니다.",
      })
      setIsDialogOpen(false)
      setNewCategoryName("")
      setNewCategorySlug("")
      setNewCategoryDescription("")
      fetchCategories()
    } catch (err: any) {
      console.error("카테고리 생성 오류:", err)
      toast({
        title: "오류",
        description: err.message || "카테고리 생성 중 오류가 발생했습니다.",
        variant: "destructive",
      })
    }
  }

  const confirmDeleteCategory = (categoryId: string) => {
    setCategoryToDelete(categoryId)
    setIsDeleting(true)
  }

  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return

    try {
      const res = await fetch(`/api/categories/${categoryToDelete}`, {
        method: "DELETE",
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || "카테고리 삭제에 실패했습니다")
      }

      toast({
        title: "성공",
        description: "카테고리가 삭제되었습니다.",
      })
      setIsDeleting(false)
      setCategoryToDelete(null)
      fetchCategories()
    } catch (err: any) {
      console.error("카테고리 삭제 오류:", err)
      toast({
        title: "오류",
        description: err.message || "카테고리 삭제 중 오류가 발생했습니다.",
        variant: "destructive",
      })
      setIsDeleting(false)
      setCategoryToDelete(null)
    }
  }

  const startEditingCategory = (category: Category) => {
    setEditingCategory(category)
    setEditedCategoryData({
      name: category.name,
      slug: category.slug,
      description: category.description,
    })
    setIsEditDialogOpen(true)
  }

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setEditedCategoryData({ ...editedCategoryData, [name]: value })
  }

  const handleSaveCategory = async () => {
    if (!editingCategory || !editedCategoryData.name || !editedCategoryData.slug) {
      toast({
        title: "오류",
        description: "카테고리 이름과 슬러그는 필수입니다.",
        variant: "destructive",
      })
      return
    }

    try {
      if (!editingCategory._id || typeof editingCategory._id !== 'string') {
        throw new Error('유효하지 않은 카테고리 ID입니다.')
      }

      const res = await fetch(`/api/categories/${editingCategory._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editedCategoryData),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || "카테고리 수정에 실패했습니다")
      }

      toast({
        title: "성공",
        description: "카테고리가 수정되었습니다.",
      })
      setIsEditDialogOpen(false)
      setEditingCategory(null)
      setEditedCategoryData({})
      fetchCategories()
    } catch (err: any) {
      console.error("카테고리 수정 오류:", err)
      toast({
        title: "오류",
        description: err.message || "카테고리 수정 중 오류가 발생했습니다.",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <p className="text-red-500">{error}</p>
        <Button onClick={fetchCategories} className="mt-4">다시 시도</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">카테고리 관리</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>새 카테고리</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>새 카테고리 생성</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">이름</Label>
                <Input id="name" value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="slug" className="text-right">슬러그</Label>
                <Input id="slug" value={newCategorySlug} onChange={(e) => setNewCategorySlug(e.target.value)} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">설명</Label>
                <Input id="description" value={newCategoryDescription} onChange={(e) => setNewCategoryDescription(e.target.value)} className="col-span-3" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>취소</Button>
              <Button onClick={handleCreateCategory}>생성</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>이름</TableHead>
              <TableHead>슬러그</TableHead>
              <TableHead>설명</TableHead>
              <TableHead>포스트 수</TableHead>
              <TableHead className="text-right">액션</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((category) => (
              <TableRow key={category._id?.toString() || category.slug}>
                <TableCell className="font-medium">{category.name}</TableCell>
                <TableCell>{category.slug}</TableCell>
                <TableCell>{category.description}</TableCell>
                <TableCell>{'postCount' in category && category.postCount !== undefined ? category.postCount : 'N/A'}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => startEditingCategory(category)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => confirmDeleteCategory(category._id?.toString() || category.slug)}>
                    <Trash className="h-4 w-4 text-red-500" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {categories.length === 0 && !loading && !error && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4">
                  카테고리가 없습니다.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDeleting} onOpenChange={setIsDeleting}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>카테고리 삭제 확인</DialogTitle>
            <DialogDescription>
              이 카테고리를 정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleting(false)}>취소</Button>
            <Button variant="destructive" onClick={handleDeleteCategory}>삭제</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {editingCategory && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>카테고리 수정</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-name" className="text-right">이름</Label>
                <Input id="edit-name" name="name" value={editedCategoryData.name} onChange={handleEditInputChange} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-slug" className="text-right">슬러그</Label>
                <Input id="edit-slug" name="slug" value={editedCategoryData.slug} onChange={handleEditInputChange} className="col-span-3" disabled={true} />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-description" className="text-right">설명</Label>
                <Input id="edit-description" name="description" value={editedCategoryData.description} onChange={handleEditInputChange} className="col-span-3" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>취소</Button>
              <Button onClick={handleSaveCategory}>저장</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
} 