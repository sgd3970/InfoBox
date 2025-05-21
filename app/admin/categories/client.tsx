"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Search, Edit, Trash, Loader2 } from "lucide-react"
import type { Category } from "@/lib/models"

interface AdminCategoriesClientProps {
  initialCategories: Category[];
}

export default function AdminCategoriesClient({ initialCategories }: AdminCategoriesClientProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [categories, setCategories] = useState<Category[]>(initialCategories)
  const [loading, setLoading] = useState(false)

  // 검색 필터링
  const filteredCategories = categories.filter((category) => {
    const searchContent = `${category.name} ${category.description || ""}`.toLowerCase()
    return searchContent.includes(searchTerm.toLowerCase())
  })

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <Input
            placeholder="카테고리 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          새 카테고리
        </Button>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>이름</TableHead>
              <TableHead>슬러그</TableHead>
              <TableHead>설명</TableHead>
              <TableHead>포스트 수</TableHead>
              <TableHead className="text-right">작업</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCategories.map((category) => (
              <TableRow key={category._id}>
                <TableCell className="font-medium">{category.name}</TableCell>
                <TableCell>{category.slug}</TableCell>
                <TableCell>{category.description || "-"}</TableCell>
                <TableCell>{category.postCount}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700">
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filteredCategories.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4">
                  검색 결과가 없습니다.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
} 