import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "개인정보처리방침 | InfoBox",
  description: "InfoBox 개인정보처리방침",
}

export default function PrivacyPage() {
  return (
    <div className="container py-10 prose dark:prose-invert max-w-none">
      <h1>개인정보처리방침</h1>

      <p>InfoBox(이하 '사이트')는 「개인정보 보호법」 및 관련 법령에 따라 이용자의 개인정보를 보호하고, 이와 관련된 권리를 존중합니다. 본 사이트는 회원가입 없이 댓글 작성과 통계 수집을 목적으로 일부 정보를 수집·활용합니다.</p>

      <h2>1. 수집하는 항목</h2>
      <ul>
        <li><strong>댓글 작성 시</strong>: 닉네임, 비밀번호 (서버 내 암호화 저장)</li>
        <li><strong>서비스 이용 시</strong>: IP 주소, 브라우저 정보, 방문 일시 등 (쿠키 기반 자동 수집)</li>
      </ul>

      <h2>2. 개인정보 수집 및 이용 목적</h2>
      <ul>
        <li>댓글 작성 및 관리 (수정/삭제 인증)</li>
        <li>사이트 접속 통계 및 서비스 개선을 위한 분석</li>
      </ul>

      <h2>3. 개인정보 보유 및 이용기간</h2>
      <ul>
        <li><strong>비밀번호</strong>는 암호화되어 저장되며, 댓글 삭제 시 함께 삭제됩니다.</li>
        <li><strong>쿠키 및 로그 정보</strong>는 통계 분석 후 일정 기간(최대 6개월) 보관 후 자동 폐기됩니다.</li>
      </ul>

      <h2>4. 개인정보의 제3자 제공</h2>
      <p>InfoBox는 이용자의 개인정보를 외부에 제공하지 않습니다.</p>

      <h2>5. 쿠키(Cookie) 사용 안내</h2>
      <ul>
        <li>사이트는 방문자 분석을 위해 쿠키를 수집할 수 있습니다.</li>
        <li>쿠키는 이용자의 컴퓨터에 저장되며, 브라우저 설정을 통해 거부할 수 있습니다.</li>
        <li>예: [쿠키 허용/차단 설정 방법] → 브라우저 설정 &gt; 개인정보 및 보안 &gt; 쿠키 및 기타 사이트 데이터</li>
      </ul>

      <h2>6. 이용자의 권리</h2>
      <ul>
        <li>비회원이 작성한 댓글은 입력한 비밀번호를 통해 직접 수정·삭제할 수 있습니다.</li>
        <li>쿠키는 브라우저 설정을 통해 차단하거나 삭제할 수 있습니다.</li>
      </ul>

      <h2>7. 개인정보 보호책임자</h2>
      <ul>
        <li>이름: 홍길동</li>
        <li>이메일: info@infobox.com</li>
      </ul>

      <p><strong>이 방침은 2025년 5월 17일부터 적용됩니다.</strong></p>
    </div>
  )
} 