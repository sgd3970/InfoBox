import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "이용약관 | InfoBox",
  description: "InfoBox 이용약관",
}

export async function generateMetadata(): Promise<Metadata> {
  const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://example.com'

  return {
    title: "이용약관 - 트렌드 스캐너",
    description: "트렌드 스캐너의 이용약관을 확인하세요.",
    openGraph: {
      title: "이용약관 - 트렌드 스캐너",
      description: "트렌드 스캐너의 이용약관을 확인하세요.",
      type: "website",
      url: `${BASE_URL}/terms`,
    },
    alternates: {
      canonical: `${BASE_URL}/terms`,
    },
  }
}

export default function TermsPage() {
  return (
    <div className="container py-10 prose dark:prose-invert max-w-none">
      <h1>이용약관</h1>

      <p>본 약관은 InfoBox(이하 '사이트')가 제공하는 콘텐츠 및 서비스의 이용과 관련하여 기본적인 조건을 규정합니다.</p>

      <h2>1. 서비스 목적</h2>
      <p>InfoBox는 일상생활에 유용한 정보를 제공하는 비회원 전용 정보 큐레이션 플랫폼입니다.</p>

      <h2>2. 이용자 권한</h2>
      <ul>
        <li>모든 이용자는 회원가입 없이 자유롭게 콘텐츠를 열람할 수 있습니다.</li>
        <li>댓글 작성 시 닉네임과 비밀번호 입력이 필요하며, 이를 통해 댓글 수정·삭제가 가능합니다.</li>
      </ul>

      <h2>3. 금지 행위</h2>
      <p>이용자는 다음 행위를 해서는 안 됩니다:</p>
      <ul>
        <li>타인의 명예를 훼손하거나 욕설, 비방 등 부적절한 표현 사용</li>
        <li>무단 광고, 스팸 댓글 작성</li>
        <li>타인의 정보를 도용하거나 사칭하는 행위</li>
        <li>사이트 운영을 방해하는 기타 행위</li>
      </ul>

      <h2>4. 콘텐츠 저작권</h2>
      <ul>
        <li>본 사이트의 모든 콘텐츠는 InfoBox 또는 제휴 저작권자에게 귀속됩니다.</li>
        <li>무단 복제, 배포, 상업적 이용을 금지합니다.</li>
      </ul>

      <h2>5. 책임의 한계</h2>
      <ul>
        <li>본 사이트에서 제공하는 정보는 참고용으로 제공되며, 정보의 정확성·완전성에 대해 법적 책임을 지지 않습니다.</li>
        <li>사용자의 선택 및 활용에 따른 결과에 대한 책임은 사용자 본인에게 있습니다.</li>
      </ul>

      <h2>6. 약관 변경</h2>
      <ul>
        <li>본 약관은 사전 고지 없이 변경될 수 있으며, 변경 시 본 페이지를 통해 공지됩니다.</li>
      </ul>

      <p><strong>시행일: 2025년 5월 17일</strong></p>
    </div>
  )
} 