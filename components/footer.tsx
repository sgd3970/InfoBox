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
            몰랐던 생활 정보, 쉽게 정리해드립니다.
          </p>
          <p className="text-sm text-muted-foreground mt-4">
            &copy; {new Date().getFullYear()} InfoBox. Designed for everyday life.
          </p>
        </div>

        <div>
          <h3 className="font-medium mb-4">링크</h3>
          <ul className="flex flex-wrap gap-4 text-sm">
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
              <Link href="/blog/tag" className="text-muted-foreground hover:text-foreground transition-colors">
                태그
              </Link>
            </li>
            <li>
              <Link href="/about" className="text-muted-foreground hover:text-foreground transition-colors">
                소개
              </Link>
            </li>
            <li>
              <Link href="/search" className="text-muted-foreground hover:text-foreground transition-colors">
                검색
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h3 className="font-medium mb-4">법적 고지</h3>
          <ul className="flex flex-wrap gap-4 text-sm">
            <li>
              <Link 
                href="/privacy" 
                className="text-muted-foreground hover:text-foreground transition-colors"
                onClick={(e) => {
                  e.preventDefault(); // Prevent default link behavior
                  window.open('/privacy', '_blank', 'width=800,height=600');
                }}
              >
                개인정보처리방침
              </Link>
            </li>
            <li>
              <Link 
                href="/terms" 
                className="text-muted-foreground hover:text-foreground transition-colors"
                onClick={(e) => {
                  e.preventDefault(); // Prevent default link behavior
                  window.open('/terms', '_blank', 'width=800,height=600');
                }}
              >
                이용약관
              </Link>
            </li>
            <li>
              <Link 
                href="/sitemap.xml" 
                className="text-muted-foreground hover:text-foreground transition-colors"
                onClick={(e) => {
                  e.preventDefault(); // Prevent default link behavior
                  window.open('/sitemap.xml', '_blank', 'width=800,height=600');
                }}
              >
                사이트맵
              </Link>
            </li>
          </ul>
        </div>
      </div>      
    </footer>
  )
}
