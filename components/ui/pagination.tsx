"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react"
import { cn } from "@/lib/utils"

const PaginationContent = React.forwardRef<HTMLUListElement, React.HTMLAttributes<HTMLUListElement>>(
  ({ className, ...props }, ref) => (
    <ul ref={ref} className={cn("flex list-none flex-row items-center justify-center gap-2", className)} {...props} />
  ),
)
PaginationContent.displayName = "PaginationContent"

const PaginationItem = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <li className="w-auto">
      <div ref={ref} className={cn("items-center", className)} {...props} />
    </li>
  ),
)
PaginationItem.displayName = "PaginationItem"

const PaginationLink = React.forwardRef<HTMLAnchorElement, React.HTMLAttributes<HTMLAnchorElement>>(
  ({ className, ...props }, ref) => {
    return (
      <a
        ref={ref}
        className={cn(
          "inline-flex h-8 w-8 items-center justify-center rounded-md border text-sm font-medium transition-colors hover:bg-secondary/50 disabled:pointer-events-none disabled:opacity-50 data-[active=true]:bg-secondary/50",
          className,
        )}
        {...props}
      />
    )
  },
)
PaginationLink.displayName = "PaginationLink"

const PaginationEllipsis = React.forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement>>(
  ({ className, ...props }, ref) => (
    <span ref={ref} className={cn("h-8 w-8 text-center [&:not([hidden])]:inline-flex", className)} {...props} />
  ),
)
PaginationEllipsis.displayName = "PaginationEllipsis"

const PaginationPrevious = React.forwardRef<HTMLAnchorElement, React.HTMLAttributes<HTMLAnchorElement>>(
  ({ className, ...props }, ref) => {
    return (
      <a
        ref={ref}
        className={cn(
          "inline-flex h-8 items-center justify-center rounded-md border border-border p-1 text-sm font-medium transition-colors hover:bg-secondary/50 disabled:pointer-events-none disabled:opacity-50 [&:has([aria-disabled=true])]:opacity-50",
          className,
        )}
        {...props}
      />
    )
  },
)
PaginationPrevious.displayName = "PaginationPrevious"

const PaginationNext = React.forwardRef<HTMLAnchorElement, React.HTMLAttributes<HTMLAnchorElement>>(
  ({ className, ...props }, ref) => {
    return (
      <a
        ref={ref}
        className={cn(
          "inline-flex h-8 items-center justify-center rounded-md border border-border p-1 text-sm font-medium transition-colors hover:bg-secondary/50 disabled:pointer-events-none disabled:opacity-50 [&:has([aria-disabled=true])]:opacity-50",
          className,
        )}
        {...props}
      />
    )
  },
)
PaginationNext.displayName = "PaginationNext"

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  siblingCount?: number
}

export function Pagination({ currentPage, totalPages, onPageChange, siblingCount = 1 }: PaginationProps) {
  // 페이지 범위 생성 함수
  const generatePagesArray = (start: number, end: number) => {
    return Array.from({ length: end - start + 1 }, (_, i) => start + i)
  }

  // 페이지 범위 계산
  const renderPagination = () => {
    // 항상 표시할 첫 페이지와 마지막 페이지
    const firstPage = 1
    const lastPage = totalPages

    // 현재 페이지 주변에 표시할 페이지 수 계산
    const leftSiblingIndex = Math.max(currentPage - siblingCount, firstPage)
    const rightSiblingIndex = Math.min(currentPage + siblingCount, lastPage)

    // 생략 부호 표시 여부
    const showLeftDots = leftSiblingIndex > firstPage + 1
    const showRightDots = rightSiblingIndex < lastPage - 1

    // 페이지 버튼 배열 생성
    const pages = []

    // 첫 페이지 항상 추가
    if (firstPage < leftSiblingIndex) {
      pages.push(firstPage)
    }

    // 왼쪽 생략 부호 추가
    if (showLeftDots) {
      pages.push(-1) // -1은 생략 부호를 의미
    }

    // 현재 페이지 주변 페이지 추가
    const range = generatePagesArray(leftSiblingIndex, rightSiblingIndex)
    pages.push(...range)

    // 오른쪽 생략 부호 추가
    if (showRightDots) {
      pages.push(-2) // -2는 생략 부호를 의미
    }

    // 마지막 페이지 항상 추가
    if (lastPage > rightSiblingIndex) {
      pages.push(lastPage)
    }

    return pages
  }

  const pages = renderPagination()

  return (
    <div className="flex items-center justify-center space-x-2 py-8">
      <button
        className="inline-flex h-8 items-center justify-center rounded-md border border-border p-1 text-sm font-medium transition-colors hover:bg-secondary/50 disabled:pointer-events-none disabled:opacity-50"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <ChevronLeft className="h-4 w-4" />
        <span className="sr-only">이전 페이지</span>
      </button>

      {pages.map((page, i) => {
        // 생략 부호 렌더링
        if (page < 0) {
          return (
            <button key={`ellipsis-${i}`} className="inline-flex h-8 w-8 items-center justify-center" disabled>
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">더 많은 페이지</span>
            </button>
          )
        }

        // 페이지 버튼 렌더링
        return (
          <button
            key={page}
            className={cn(
              "inline-flex h-8 w-8 items-center justify-center rounded-md border text-sm font-medium transition-colors",
              currentPage === page ? "bg-secondary/50 text-secondary-foreground" : "hover:bg-secondary/50",
            )}
            onClick={() => onPageChange(page)}
          >
            {page}
          </button>
        )
      })}

      <button
        className="inline-flex h-8 items-center justify-center rounded-md border border-border p-1 text-sm font-medium transition-colors hover:bg-secondary/50 disabled:pointer-events-none disabled:opacity-50"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        <ChevronRight className="h-4 w-4" />
        <span className="sr-only">다음 페이지</span>
      </button>
    </div>
  )
}

export { PaginationContent, PaginationItem, PaginationLink, PaginationEllipsis, PaginationPrevious, PaginationNext }
