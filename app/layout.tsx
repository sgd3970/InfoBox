import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Noto_Sans_KR } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { CookieConsent } from "@/components/cookie-consent"
import { Analytics } from "@/components/analytics"
import { PWARegister } from "@/components/pwa-register"
import ServiceWorkerRegistration from "./sw"
import { Suspense } from "react"
import { AuthProvider } from "@/contexts/auth-context"
import { WebVitals } from "@/components/web-vitals"
import { ErrorMonitoring } from "@/components/error-monitoring"
import { UserBehaviorTracking } from "@/components/user-behavior-tracking"

const inter = Inter({ subsets: ["latin"] })
const notoSansKr = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
})

export const metadata: Metadata = {
  title: {
    default: "InfoBox - 정보 공유 플랫폼",
    template: "%s | InfoBox",
  },
  description: "최신 기술 트렌드와 유용한 정보를 제공하는 블로그 플랫폼입니다.",
  keywords: ["블로그", "정보", "기술", "트렌드", "개발", "디자인"],
  authors: [{ name: "InfoBox Team" }],
  creator: "InfoBox",
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: process.env.NEXT_PUBLIC_APP_URL,
    title: "InfoBox - 정보 공유 플랫폼",
    description: "최신 기술 트렌드와 유용한 정보를 제공하는 블로그 플랫폼입니다.",
    siteName: "InfoBox",
  },
  twitter: {
    card: "summary_large_image",
    title: "InfoBox - 정보 공유 플랫폼",
    description: "최신 기술 트렌드와 유용한 정보를 제공하는 블로그 플랫폼입니다.",
    creator: "@infobox",
  },
  robots: {
    index: true,
    follow: true,
  },
  manifest: "/manifest",
  generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className={`${inter.className} ${notoSansKr.className}`}>
        <AuthProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            <div className="flex flex-col min-h-screen">
              <Navbar />
              <Suspense>
                <main className="flex-1">{children}</main>
              </Suspense>
              <Footer />
              <CookieConsent />
              <PWARegister />
            </div>
          </ThemeProvider>
          <Analytics />
          <WebVitals />
          <ErrorMonitoring />
          <Suspense>
            <UserBehaviorTracking />
          </Suspense>
          <ServiceWorkerRegistration />
        </AuthProvider>
      </body>
    </html>
  )
}
