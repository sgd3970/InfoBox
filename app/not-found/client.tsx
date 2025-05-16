"use client"

// 클라이언트 컴포넌트로 분리하고 useSearchParams 사용 부분 수정
export default function NotFoundClient() {
  // useSearchParams() 훅 제거 - 실제로 사용하지 않으므로 제거해도 됨

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-12 bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900 dark:text-gray-100">404</h1>
        <h2 className="mt-4 text-2xl font-medium text-gray-700 dark:text-gray-300">페이지를 찾을 수 없습니다</h2>
        <p className="mt-2 text-gray-500 dark:text-gray-400">
          요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.
        </p>
        <div className="mt-6">
          <a
            href="/"
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            홈으로 돌아가기
          </a>
        </div>
      </div>
    </div>
  )
}
