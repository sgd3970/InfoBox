import Link from "next/link"

export function Footer() {
  return (
    <footer className="border-t py-8">
      <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
        <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
              IB
            </div>
            <span className="font-bold">InfoBox</span>
          </div>
          <nav className="flex gap-4 md:ml-4">
            <Link
              href="/about"
              className="text-sm text-muted-foreground transition-colors hover:text-primary"
            >
              소개
            </Link>
            <Link
              href="/terms"
              className="text-sm text-muted-foreground transition-colors hover:text-primary"
            >
              이용약관
            </Link>
            <Link
              href="/privacy"
              className="text-sm text-muted-foreground transition-colors hover:text-primary"
            >
              개인정보처리방침
            </Link>
          </nav>
        </div>
        <div className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} InfoBox. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
