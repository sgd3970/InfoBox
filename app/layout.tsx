import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Noto_Sans_KR } from "next/font/google"
import "./globals.css"
import { Providers } from "@/components/providers"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { CookieConsent } from "@/components/cookie-consent"
import { Analytics } from "@/components/analytics"
import { PWARegister } from "@/components/pwa-register"
import ServiceWorkerRegistration from "./sw"
import { Suspense } from "react"
import { WebVitals } from "@/components/web-vitals"
import { ErrorMonitoring } from "@/components/error-monitoring"
import { UserBehaviorTracking } from "@/components/user-behavior-tracking"
import Script from "next/script"

const inter = Inter({ subsets: ["latin"] })
const notoSansKr = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://info-5w85xeawr-trendscanners-projects.vercel.app'),
  title: {
    default: "InfoBox",
    template: "%s | InfoBox",
  },
  description: "최신 기술 트렌드와 유용한 정보를 제공하는 블로그입니다.",
  keywords: ["블로그", "기술", "트렌드", "정보"],
  authors: [{ name: "InfoBox Team" }],
  creator: "InfoBox",
  publisher: "InfoBox",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: '/favicon.png',
    shortcut: '/favicon.png',
    apple: '/favicon.png',
  },
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
      <head>
        <link
          rel="preload"
          href="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8478624096187058"
          as="script"
          crossOrigin="anonymous"
        />
        <Script
          id="adsense-script"
          async
          strategy="afterInteractive"
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8478624096187058"
          crossOrigin="anonymous"
        />
      </head>
      <body className={`${inter.className} ${notoSansKr.className}`} style={{ overflowX: 'hidden' }}>
        <Providers>
            <div className="flex flex-col min-h-screen">
              <Navbar />
              <main className="flex-1">{children}</main>
              <Footer />
              <CookieConsent />
              <PWARegister />
            </div>

          <Suspense fallback={null}>
            <Analytics />
            <UserBehaviorTracking />
          </Suspense>

          <WebVitals />
          <ErrorMonitoring />
          <ServiceWorkerRegistration />
        </Providers>
      </body>
    </html>
  )
}
