import Link from "next/link"
import Image from "next/image"
import type { Post, Category } from "@/lib/models"
import { HomePageClient } from "./home-page-client"
import { Metadata } from "next"
import React from "react";

async function getPosts(): Promise<Post[]> {
  try {
    const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://example.com'
    // API 라우트에서 최신 포스트 가져오기
    const res = await fetch(`${BASE_URL}/api/posts/latest`, {
      cache: 'no-store' // 캐시 비활성화하여 매번 새로운 응답 받기
    })
    
    if (!res.ok) {
      console.error("최신 포스트 API 호출 실패:", res.status)
      return []
    }
    
    // 응답을 한 번만 읽기
    const posts = await res.json()
    return posts as Post[]
  } catch (error) {
    console.error("최신 포스트 fetch 오류:", error)
    return []
  }
}

async function getCategories(): Promise<Category[]> {
  try {
    const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://example.com'
    // API 라우트에서 카테고리 가져오기
    const res = await fetch(`${BASE_URL}/api/categories`, {
      cache: 'no-store' // 캐시 비활성화하여 매번 새로운 응답 받기
    })

    if (!res.ok) {
        console.error("카테고리 API 호출 실패:", res.status)
        return []
    }

    // 응답을 한 번만 읽기
    const categories = await res.json()
    return categories as Category[]
  } catch (error) {
    console.error("카테고리 fetch 오류:", error)
    return []
  }
}

export default function Home() {
  return (
    <main className="relative min-h-screen bg-gradient-to-br from-indigo-400 to-purple-500 overflow-x-hidden">
      {/* Hero Section */}
      <section className="hero-section relative min-h-screen flex items-center">
        <div className="absolute inset-0 w-full h-full animate-float opacity-60 pointer-events-none">
          {/* SVG Grid BG */}
          <svg width="100%" height="100%" viewBox="0 0 100 100" className="w-full h-full">
            <defs>
              <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeOpacity="0.1" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100" height="100" fill="url(#grid)" />
          </svg>
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center text-white">
            <h1 className="hero-title text-5xl md:text-7xl font-extrabold mb-4 drop-shadow-lg animate-slideInUp">InfoBox</h1>
            <p className="hero-subtitle text-xl md:text-2xl mb-6 opacity-90 animate-slideInUp delay-200">대한민국 국민을 위한 필수 정보 허브</p>
            <p className="hero-description text-base md:text-lg max-w-xl mx-auto mb-10 opacity-80 animate-slideInUp delay-400">
              정부지원금, 각종 혜택, 세금 신고 등 놓치기 쉬운 중요한 정보들을 한 곳에서 쉽고 빠르게 확인하세요. 복잡한 행정 절차도 InfoBox와 함께라면 간단해집니다.
            </p>
            <a href="#features" className="cta-button inline-block bg-white/20 backdrop-blur px-10 py-4 rounded-full font-semibold text-lg border-2 border-white/30 hover:bg-white/30 transition-all animate-slideInUp delay-600">지금 시작하기</a>
          </div>
        </div>
        <div className="scroll-indicator absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce text-white text-3xl opacity-70">↓</div>
      </section>

      {/* Features Section */}
      <section id="features" className="features-section py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="section-title text-4xl font-bold text-center mb-12 text-gray-800">왜 InfoBox인가요?</h2>
          <div className="features-grid grid gap-8 md:grid-cols-2 lg:grid-cols-3 mt-8">
            {[
              { icon: "💰", title: "정부지원금 정보", desc: "근로장려금, 자녀장려금, 각종 지원사업 등 받을 수 있는 모든 정부지원금 정보를 놓치지 마세요." },
              { icon: "📅", title: "기간별 필수 체크", desc: "세금 신고, 건강보험료 확인, 연말정산 등 시기별로 꼭 해야 할 일들을 알림으로 받아보세요." },
              { icon: "🎯", title: "맞춤형 혜택", desc: "나이, 소득, 가족 구성에 따른 개인별 맞춤 혜택과 지원제도를 추천해드립니다." },
              { icon: "🚀", title: "간편한 신청", desc: "복잡한 신청 절차와 필요 서류를 단계별로 쉽게 안내해 빠른 신청이 가능합니다." },
              { icon: "🔔", title: "실시간 알림", desc: "새로운 지원제도나 중요한 마감일을 놓치지 않도록 실시간으로 알려드립니다." },
              { icon: "📱", title: "언제 어디서나", desc: "PC, 모바일 어디서든 접속 가능하며 직관적인 인터페이스로 누구나 쉽게 이용할 수 있습니다." },
            ].map((f, i) => (
              <div key={f.title} className="feature-card bg-white p-10 rounded-2xl text-center shadow-lg relative overflow-hidden hover:-translate-y-2 hover:shadow-2xl transition-all">
                <div className="feature-icon w-20 h-20 mx-auto mb-5 flex items-center justify-center rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 text-3xl">{f.icon}</div>
                <h3 className="feature-title text-xl font-semibold mb-2 text-gray-800">{f.title}</h3>
                <p className="feature-description text-gray-600">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section bg-gradient-to-br from-gray-800 to-gray-700 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="stats-grid grid gap-10 md:grid-cols-2 lg:grid-cols-4">
            <div className="stat-item text-center">
              <div className="stat-number text-5xl font-extrabold mb-2 text-blue-400">50+</div>
              <div className="stat-label text-lg opacity-90">정부지원제도</div>
            </div>
            <div className="stat-item text-center">
              <div className="stat-number text-5xl font-extrabold mb-2 text-blue-400">100%</div>
              <div className="stat-label text-lg opacity-90">무료 서비스</div>
            </div>
            <div className="stat-item text-center">
              <div className="stat-number text-5xl font-extrabold mb-2 text-blue-400">24/7</div>
              <div className="stat-label text-lg opacity-90">언제든 이용가능</div>
            </div>
            <div className="stat-item text-center">
              <div className="stat-number text-5xl font-extrabold mb-2 text-blue-400">∞</div>
              <div className="stat-label text-lg opacity-90">무제한 정보 제공</div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="about-section py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="about-content grid md:grid-cols-2 gap-16 items-center">
            <div className="about-text">
              <h2 className="text-4xl font-bold mb-8 text-gray-800">복잡한 행정, 이제 간단하게</h2>
              <p className="text-lg text-gray-600 mb-4">매년 수많은 정부지원금과 혜택이 있지만, 정작 필요한 사람들이 놓치는 경우가 많습니다. 복잡한 신청 절차와 까다로운 조건들 때문에 포기하는 경우도 적지 않죠.</p>
              <p className="text-lg text-gray-600 mb-4">InfoBox는 이러한 문제를 해결하기 위해 탄생했습니다. 모든 정부지원제도를 한눈에 보기 쉽게 정리하고, 개인의 상황에 맞는 맞춤형 정보를 제공합니다.</p>
              <p className="text-lg text-gray-600">더 이상 복잡한 행정 절차 때문에 혜택을 놓치지 마세요. InfoBox와 함께 스마트한 정보 생활을 시작하세요.</p>
            </div>
            <div className="about-image relative">
              <svg width="100%" height="300" viewBox="0 0 400 300" className="rounded-xl shadow-lg">
                <defs>
                  <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#667eea" stopOpacity="1" />
                    <stop offset="100%" stopColor="#764ba2" stopOpacity="1" />
                  </linearGradient>
                </defs>
                <rect x="50" y="50" width="300" height="180" rx="10" fill="url(#grad1)" opacity="0.1"/>
                <rect x="60" y="60" width="280" height="140" rx="5" fill="white"/>
                <rect x="80" y="80" width="60" height="8" rx="4" fill="url(#grad1)" opacity="0.6"/>
                <rect x="80" y="95" width="45" height="8" rx="4" fill="url(#grad1)" opacity="0.4"/>
                <rect x="80" y="110" width="35" height="8" rx="4" fill="url(#grad1)" opacity="0.3"/>
                <circle cx="200" cy="95" r="15" fill="url(#grad1)" opacity="0.2"/>
                <text x="200" y="100" textAnchor="middle" fill="url(#grad1)" fontSize="12">💰</text>
                <circle cx="240" cy="95" r="15" fill="url(#grad1)" opacity="0.2"/>
                <text x="240" y="100" textAnchor="middle" fill="url(#grad1)" fontSize="12">📅</text>
                <circle cx="280" cy="95" r="15" fill="url(#grad1)" opacity="0.2"/>
                <text x="280" y="100" textAnchor="middle" fill="url(#grad1)" fontSize="12">🎯</text>
                <rect x="80" y="140" width="240" height="40" rx="8" fill="url(#grad1)" opacity="0.1"/>
                <circle cx="300" cy="160" r="12" fill="url(#grad1)" opacity="0.8"/>
                <text x="300" y="165" textAnchor="middle" fill="white" fontSize="10">✓</text>
                <rect x="280" y="120" width="60" height="100" rx="15" fill="url(#grad1)" opacity="0.1"/>
                <rect x="290" y="130" width="40" height="70" rx="5" fill="white"/>
                <circle cx="310" cy="210" r="8" fill="url(#grad1)" opacity="0.3"/>
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer bg-gray-900 text-white py-10 text-center">
        <div className="container mx-auto px-4">
          <p>&copy; 2024 InfoBox. 대한민국 국민의 알 권리를 지켜갑니다.</p>
        </div>
      </footer>

      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(2deg); }
        }
        .animate-float { animation: float 20s ease-in-out infinite; }
        @keyframes slideInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slideInUp { animation: slideInUp 1s ease-out; }
        .animate-slideInUp.delay-200 { animation-delay: 0.2s; }
        .animate-slideInUp.delay-400 { animation-delay: 0.4s; }
        .animate-slideInUp.delay-600 { animation-delay: 0.6s; }
        .scroll-indicator { animation: bounce 2s infinite; }
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% { transform: translateX(-50%) translateY(0); }
          40% { transform: translateX(-50%) translateY(-10px); }
          60% { transform: translateX(-50%) translateY(-5px); }
        }
      `}</style>
    </main>
  );
}

export async function generateMetadata(): Promise<Metadata> {
  const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://example.com'

  return {
    title: "트렌드 스캐너 - 최신 트렌드와 기술 소식",
    description: "최신 트렌드와 기술 소식을 한눈에 확인하세요.",
    openGraph: {
      title: "트렌드 스캐너 - 최신 트렌드와 기술 소식",
      description: "최신 트렌드와 기술 소식을 한눈에 확인하세요.",
      type: "website",
      url: BASE_URL,
    },
    alternates: {
      canonical: BASE_URL,
    },
  }
}
