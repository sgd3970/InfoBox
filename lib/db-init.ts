import clientPromise from "./mongodb"
import type { Post, User, Category, Tag, Comment, PageView, Referrer, DeviceStats } from "./models"

export async function initDatabase() {
  try {
    const client = await clientPromise
    const db = client.db()

    // 컬렉션 생성
    await db.createCollection("users")
    await db.createCollection("posts")
    await db.createCollection("categories")
    await db.createCollection("tags")
    await db.createCollection("comments")
    await db.createCollection("pageviews")
    await db.createCollection("referrers")
    await db.createCollection("devicestats")

    // 인덱스 생성
    await db.collection("users").createIndex({ email: 1 }, { unique: true })
    await db.collection("posts").createIndex({ slug: 1 }, { unique: true })
    await db.collection("posts").createIndex({ category: 1 })
    await db.collection("posts").createIndex({ tags: 1 })
    await db.collection("categories").createIndex({ slug: 1 }, { unique: true })
    await db.collection("tags").createIndex({ slug: 1 }, { unique: true })
    await db.collection("comments").createIndex({ postId: 1 })
    await db.collection("pageviews").createIndex({ path: 1, date: 1 }, { unique: true })

    console.log("데이터베이스 초기화 완료")
    return true
  } catch (error) {
    console.error("데이터베이스 초기화 오류:", error)
    return false
  }
}

export async function seedDatabase() {
  try {
    const client = await clientPromise
    const db = client.db()

    // 기존 데이터 확인
    const userCount = await db.collection("users").countDocuments()
    if (userCount > 0) {
      console.log("이미 데이터가 존재합니다. 시드 작업을 건너뜁니다.")
      return true
    }

    // 사용자 데이터 삽입
    const users: User[] = [
      {
        name: "관리자",
        email: "admin@example.com",
        password: "$2b$10$GQD4FY8cL5vhvi1kQA1tHOzr1HsXRoHDEEr1jqN9UQHwj1PMrGJHy", // 'password'의 해시
        role: "admin",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "사용자",
        email: "user@example.com",
        password: "$2b$10$GQD4FY8cL5vhvi1kQA1tHOzr1HsXRoHDEEr1jqN9UQHwj1PMrGJHy", // 'password'의 해시
        role: "user",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]
    await db.collection("users").insertMany(users)

    // 카테고리 데이터 삽입
    const categories: Category[] = [
      { name: "Development", slug: "development", description: "개발 관련 포스트", postCount: 3 },
      { name: "Design", slug: "design", description: "디자인 관련 포스트", postCount: 1 },
      { name: "AI", slug: "ai", description: "AI 관련 포스트", postCount: 1 },
      { name: "Performance", slug: "performance", description: "성능 최적화 관련 포스트", postCount: 1 },
      { name: "Business", slug: "business", description: "비즈니스 관련 포스트", postCount: 1 },
    ]
    await db.collection("categories").insertMany(categories)

    // 태그 데이터 삽입
    const tags: Tag[] = [
      { name: "Next.js", slug: "nextjs", postCount: 2 },
      { name: "React", slug: "react", postCount: 3 },
      { name: "MDX", slug: "mdx", postCount: 1 },
      { name: "블로그", slug: "blog", postCount: 1 },
      { name: "Tailwind CSS", slug: "tailwind-css", postCount: 2 },
      { name: "반응형 디자인", slug: "responsive-design", postCount: 1 },
      { name: "CSS", slug: "css", postCount: 1 },
      { name: "웹 디자인", slug: "web-design", postCount: 1 },
      { name: "TypeScript", slug: "typescript", postCount: 2 },
      { name: "JavaScript", slug: "javascript", postCount: 2 },
      { name: "프로그래밍", slug: "programming", postCount: 1 },
      { name: "타입 시스템", slug: "type-system", postCount: 1 },
      { name: "서버 컴포넌트", slug: "server-components", postCount: 1 },
      { name: "클라이언트 컴포넌트", slug: "client-components", postCount: 1 },
      { name: "Zustand", slug: "zustand", postCount: 1 },
      { name: "상태 관리", slug: "state-management", postCount: 1 },
      { name: "웹 성능", slug: "web-performance", postCount: 1 },
      { name: "최적화", slug: "optimization", postCount: 1 },
      { name: "사용자 경험", slug: "user-experience", postCount: 1 },
      { name: "프론트엔드", slug: "frontend", postCount: 1 },
      { name: "AI", slug: "ai", postCount: 1 },
      { name: "콘텐츠 마케팅", slug: "content-marketing", postCount: 1 },
      { name: "자동화", slug: "automation", postCount: 1 },
      { name: "생성형 AI", slug: "generative-ai", postCount: 1 },
    ]
    await db.collection("tags").insertMany(tags)

    // 포스트 데이터 삽입
    const posts: Post[] = [
      {
        title: "Next.js와 MDX로 블로그 만들기",
        description: "Next.js와 MDX를 활용하여 최신 블로그를 구축하는 방법을 알아봅니다.",
        content:
          "# Next.js와 MDX로 블로그 만들기\n\n이 글에서는 Next.js와 MDX를 활용하여 블로그를 만드는 방법을 알아봅니다.\n\n## Next.js 소개\n\nNext.js는 React 기반의 프레임워크로, 서버 사이드 렌더링, 정적 사이트 생성 등 다양한 렌더링 방식을 지원합니다.\n\n## MDX 활용하기\n\nMDX는 마크다운에 JSX를 추가한 형식으로, 마크다운 내에서 React 컴포넌트를 사용할 수 있습니다.",
        date: "2023-05-16",
        category: "Development",
        slug: "nextjs-mdx-blog",
        tags: ["Next.js", "MDX", "React", "블로그"],
        image: "/placeholder.svg?height=400&width=800",
        author: "홍길동",
        authorId: "1",
        featured: true,
        views: 1245,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        title: "Tailwind CSS로 반응형 디자인 구현하기",
        description: "Tailwind CSS를 사용하여 모든 디바이스에 최적화된 반응형 웹 디자인을 구현하는 방법을 알아봅니다.",
        content:
          "# Tailwind CSS로 반응형 디자인 구현하기\n\n이 글에서는 Tailwind CSS를 사용하여 반응형 디자인을 구현하는 방법을 알아봅니다.\n\n## Tailwind CSS 소개\n\nTailwind CSS는 유틸리티 우선 CSS 프레임워크로, 클래스 이름을 통해 스타일을 적용합니다.\n\n## 반응형 디자인 구현하기\n\nTailwind CSS에서는 sm:, md:, lg:, xl: 등의 접두사를 사용하여 반응형 디자인을 쉽게 구현할 수 있습니다.",
        date: "2023-05-10",
        category: "Design",
        slug: "responsive-design-with-tailwind",
        tags: ["Tailwind CSS", "반응형 디자인", "CSS", "웹 디자인"],
        image: "/placeholder.svg?height=400&width=800",
        author: "김철수",
        authorId: "2",
        featured: false,
        views: 876,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        title: "TypeScript 타입 시스템 마스터하기",
        description:
          "TypeScript의 고급 타입 기능을 활용하여 더 안전하고 유지보수하기 쉬운 코드를 작성하는 방법을 알아봅니다.",
        content:
          "# TypeScript 타입 시스템 마스터하기\n\n이 글에서는 TypeScript의 고급 타입 기능을 알아봅니다.\n\n## 기본 타입\n\nTypeScript는 JavaScript의 기본 타입 외에도 다양한 타입을 제공합니다.\n\n## 고급 타입 기능\n\n제네릭, 유니온 타입, 인터섹션 타입 등 TypeScript의 고급 타입 기능을 활용하면 더 안전한 코드를 작성할 수 있습니다.",
        date: "2023-05-05",
        category: "Development",
        slug: "mastering-typescript-types",
        tags: ["TypeScript", "JavaScript", "프로그래밍", "타입 시스템"],
        image: "/placeholder.svg?height=400&width=800",
        author: "박영희",
        authorId: "3",
        featured: false,
        views: 654,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        title: "서버 컴포넌트와 클라이언트 컴포넌트의 차이점",
        description: "React 서버 컴포넌트와 클라이언트 컴포넌트의 차이점과 각각의 사용 사례를 알아봅니다.",
        content:
          "# 서버 컴포넌트와 클라이언트 컴포넌트의 차이점\n\n이 글에서는 React 서버 컴포넌트와 클라이언트 컴포넌트의 차이점을 알아봅니다.\n\n## 서버 컴포넌트\n\n서버 컴포넌트는 서버에서 렌더링되어 클라이언트로 전송됩니다. 이를 통해 번들 크기를 줄이고 초기 로딩 성능을 개선할 수 있습니다.\n\n## 클라이언트 컴포넌트\n\n클라이언트 컴포넌트는 브라우저에서 렌더링되며, 상호작용이 필요한 UI 요소에 적합합니다.",
        date: "2023-04-28",
        category: "Development",
        slug: "server-vs-client-components",
        tags: ["React", "Next.js", "서버 컴포넌트", "클라이언트 컴포넌트"],
        image: "/placeholder.svg?height=400&width=800",
        author: "이민수",
        authorId: "4",
        featured: false,
        views: 543,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        title: "효과적인 상태 관리를 위한 Zustand 활용법",
        description: "React 애플리케이션에서 Zustand를 사용하여 상태를 효과적으로 관리하는 방법을 알아봅니다.",
        content:
          "# 효과적인 상태 관리를 위한 Zustand 활용법\n\n이 글에서는 Zustand를 사용한 상태 관리 방법을 알아봅니다.\n\n## Zustand 소개\n\nZustand는 작고 빠른 상태 관리 라이브러리로, React 훅을 기반으로 합니다.\n\n## Zustand 활용하기\n\nZustand를 사용하면 Redux보다 간단하게 상태를 관리할 수 있으며, 보일러플레이트 코드를 줄일 수 있습니다.",
        date: "2023-04-20",
        category: "Development",
        slug: "effective-state-management-with-zustand",
        tags: ["React", "Zustand", "상태 관리", "JavaScript"],
        image: "/placeholder.svg?height=400&width=800",
        author: "최지원",
        authorId: "5",
        featured: false,
        views: 432,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        title: "웹 성능 최적화 기법 10가지",
        description: "웹사이트 로딩 속도와 사용자 경험을 향상시키는 10가지 성능 최적화 기법을 알아봅니다.",
        content:
          "# 웹 성능 최적화 기법 10가지\n\n이 글에서는 웹사이트 성능을 최적화하는 10가지 방법을 알아봅니다.\n\n## 1. 이미지 최적화\n\n이미지는 웹페이지의 크기를 결정하는 주요 요소입니다. WebP 형식 사용, 적절한 크기로 리사이징, 지연 로딩 등의 기법을 활용하세요.\n\n## 2. 코드 분할\n\n코드 분할을 통해 필요한 코드만 로드하여 초기 로딩 시간을 단축할 수 있습니다.",
        date: "2023-04-15",
        category: "Performance",
        slug: "web-performance-optimization-techniques",
        tags: ["웹 성능", "최적화", "사용자 경험", "프론트엔드"],
        image: "/placeholder.svg?height=400&width=800",
        author: "정성훈",
        authorId: "6",
        featured: false,
        views: 321,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        title: "AI를 활용한 콘텐츠 생성 전략",
        description: "인공지능 도구를 활용하여 효과적인 콘텐츠를 생성하고 마케팅에 활용하는 방법을 알아봅니다.",
        content:
          "# AI를 활용한 콘텐츠 생성 전략\n\n이 글에서는 AI를 활용한 콘텐츠 생성 방법을 알아봅니다.\n\n## AI 콘텐츠 생성 도구\n\nGPT-4, DALL-E, Midjourney 등 다양한 AI 도구를 활용하여 텍스트, 이미지, 비디오 콘텐츠를 생성할 수 있습니다.\n\n## 효과적인 프롬프트 작성법\n\nAI에게 좋은 결과물을 얻기 위해서는 명확하고 구체적인 프롬프트를 작성하는 것이 중요합니다.",
        date: "2023-04-10",
        category: "AI",
        slug: "ai-content-generation-strategies",
        tags: ["AI", "콘텐츠 마케팅", "자동화", "생성형 AI"],
        image: "/placeholder.svg?height=400&width=800",
        author: "김태희",
        authorId: "7",
        featured: false,
        views: 210,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]
    await db.collection("posts").insertMany(posts)

    // 댓글 데이터 삽입
    const comments: Comment[] = [
      {
        postId: "1",
        postSlug: "nextjs-mdx-blog",
        author: "김철수",
        authorId: "2",
        content: "정말 유익한 글이네요. Next.js와 MDX 조합이 블로그에 최적화되어 있다는 것을 알게 되었습니다.",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        postId: "1",
        postSlug: "nextjs-mdx-blog",
        author: "박영희",
        authorId: "3",
        content: "MDX를 처음 알게 되었는데, 마크다운에 React 컴포넌트를 추가할 수 있다니 정말 편리하네요!",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        postId: "2",
        postSlug: "responsive-design-with-tailwind",
        author: "이민수",
        authorId: "4",
        content: "Tailwind CSS는 정말 생산성을 높여주는 것 같아요. 특히 반응형 디자인을 구현할 때 정말 편리합니다.",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]
    await db.collection("comments").insertMany(comments)

    // 페이지뷰 데이터 삽입
    const today = new Date().toISOString().split("T")[0]
    const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0]
    const twoDaysAgo = new Date(Date.now() - 86400000 * 2).toISOString().split("T")[0]

    const pageViews: PageView[] = [
      { path: "/", date: today, count: 450 },
      { path: "/", date: yesterday, count: 420 },
      { path: "/", date: twoDaysAgo, count: 380 },
      { path: "/blog", date: today, count: 320 },
      { path: "/blog", date: yesterday, count: 290 },
      { path: "/blog", date: twoDaysAgo, count: 270 },
      { path: "/blog/development/nextjs-mdx-blog", date: today, count: 180 },
      { path: "/blog/development/nextjs-mdx-blog", date: yesterday, count: 150 },
      { path: "/blog/development/nextjs-mdx-blog", date: twoDaysAgo, count: 120 },
      { path: "/blog/design/responsive-design-with-tailwind", date: today, count: 120 },
      { path: "/blog/design/responsive-design-with-tailwind", date: yesterday, count: 100 },
      { path: "/blog/design/responsive-design-with-tailwind", date: twoDaysAgo, count: 90 },
    ]
    await db.collection("pageviews").insertMany(pageViews)

    // 리퍼러 데이터 삽입
    const referrers: Referrer[] = [
      { source: "Google", count: 1245, date: today },
      { source: "Direct", count: 876, date: today },
      { source: "Twitter", count: 432, date: today },
      { source: "Facebook", count: 321, date: today },
      { source: "GitHub", count: 198, date: today },
    ]
    await db.collection("referrers").insertMany(referrers)

    // 디바이스 통계 데이터 삽입
    const deviceStats: DeviceStats[] = [
      { device: "desktop", count: 1560, date: today },
      { device: "mobile", count: 720, date: today },
      { device: "tablet", count: 120, date: today },
    ]
    await db.collection("devicestats").insertMany(deviceStats)

    console.log("데이터베이스 시드 작업 완료")
    return true
  } catch (error) {
    console.error("데이터베이스 시드 작업 오류:", error)
    return false
  }
}
