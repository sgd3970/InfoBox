import Link from "next/link"

export function Footer() {
  return (
    <footer className="border-t py-12 bg-muted/30">
      <div className="container grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        <div className="space-y-4">
          <Link href="/" className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
              IB
            </div>
            <span className="font-bold text-xl">InfoBox</span>
          </Link>
          <p className="text-sm text-muted-foreground">
            최신 기술 트렌드와 유용한 정보를 제공하는 블로그 플랫폼입니다.
          </p>
        </div>

        <div>
          <h3 className="font-medium mb-4">링크</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
                홈
              </Link>
            </li>
            <li>
              <Link href="/blog" className="text-muted-foreground hover:text-foreground transition-colors">
                블로그
              </Link>
            </li>
            <li>
              <Link href="/blog/categories" className="text-muted-foreground hover:text-foreground transition-colors">
                카테고리
              </Link>
            </li>
            <li>
              <Link href="/about" className="text-muted-foreground hover:text-foreground transition-colors">
                소개
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="font-medium mb-4">카테고리</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <Link
                href="/blog/category/development"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                개발
              </Link>
            </li>
            <li>
              <Link
                href="/blog/category/design"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                디자인
              </Link>
            </li>
            <li>
              <Link
                href="/blog/category/technology"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                기술
              </Link>
            </li>
            <li>
              <Link
                href="/blog/category/business"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                비즈니스
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="container mt-8 pt-8 border-t">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} InfoBox. All rights reserved.
          </p>
          <div className="flex gap-4">
            <Link href="/privacy" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              개인정보처리방침
            </Link>
            <Link href="/terms" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              이용약관
            </Link>
            <Link href="/sitemap.xml" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              사이트맵
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
