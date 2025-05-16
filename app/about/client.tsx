"use client"

import Image from "next/image"

export default function AboutClient() {
  return (
    <div className="container py-10">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">InfoBox 소개</h1>

        <div className="relative aspect-video overflow-hidden rounded-lg mb-8">
          <Image
            src="/placeholder.svg?height=400&width=800"
            alt="InfoBox 소개 이미지"
            width={800}
            height={400}
            className="object-cover"
            priority
          />
        </div>

        <div className="prose prose-lg dark:prose-invert max-w-none">
          <p>
            InfoBox는 최신 기술 트렌드와 유용한 정보를 제공하는 블로그 플랫폼입니다. 개발, 디자인, 비즈니스 등 다양한
            분야의 전문가들이 작성한 양질의 콘텐츠를 만나보세요.
          </p>

          <h2>우리의 미션</h2>
          <p>
            복잡한 정보를 쉽고 명확하게 전달하여 독자들이 빠르게 이해하고 활용할 수 있도록 돕는 것이 우리의 미션입니다.
            최신 기술과 트렌드를 지속적으로 연구하고, 이를 독자들에게 가장 효과적인 방법으로 전달합니다.
          </p>

          <h2>콘텐츠 분야</h2>
          <ul>
            <li>웹 개발 및 프로그래밍</li>
            <li>UI/UX 디자인</li>
            <li>인공지능 및 머신러닝</li>
            <li>디지털 마케팅</li>
            <li>생산성 및 자기계발</li>
          </ul>

          <h2>기술 스택</h2>
          <p>InfoBox는 최신 웹 기술을 활용하여 구축되었습니다:</p>
          <ul>
            <li>Next.js - React 기반 프레임워크</li>
            <li>Tailwind CSS - 유틸리티 우선 CSS 프레임워크</li>
            <li>MDX - 마크다운 확장 형식</li>
            <li>Vercel - 서버리스 호스팅 플랫폼</li>
          </ul>

          <h2>팀 소개</h2>
          <p>
            InfoBox는 웹 개발, 디자인, 콘텐츠 제작에 열정을 가진 전문가들로 구성되어 있습니다. 각자의 전문 분야에서
            최고의 역량을 발휘하여 양질의 콘텐츠를 제작합니다.
          </p>

          <h2>연락처</h2>
          <p>문의사항이나 제안이 있으시면 언제든지 연락주세요:</p>
          <ul>
            <li>이메일: info@infobox.com</li>
            <li>트위터: @infobox</li>
            <li>인스타그램: @infobox_official</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
