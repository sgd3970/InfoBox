export interface Post {
  title: string
  description: string
  date: string
  category: string
  slug: string
  tags?: string[]
  image?: string
  author?: string
  featured?: boolean
  body: {
    code: string
  }
}

// contentlayer/generated에서 가져오는 allPosts 대신 사용할 모의 데이터
export const allPosts: Post[] = [
  {
    title: "Next.js와 MDX로 블로그 만들기",
    description: "Next.js와 MDX를 활용하여 최신 블로그를 구축하는 방법을 알아봅니다.",
    date: "2023-05-16",
    category: "Development",
    slug: "nextjs-mdx-blog",
    tags: ["Next.js", "MDX", "React", "블로그"],
    image: "/placeholder.svg?height=400&width=800",
    author: "홍길동",
    featured: true,
    body: {
      code: "export default function MDXContent() { return <div><h1>Next.js와 MDX로 블로그 만들기</h1><p>이 글에서는 Next.js와 MDX를 활용하여 블로그를 만드는 방법을 알아봅니다.</p></div> }",
    },
  },
  {
    title: "Tailwind CSS로 반응형 디자인 구현하기",
    description: "Tailwind CSS를 사용하여 모든 디바이스에 최적화된 반응형 웹 디자인을 구현하는 방법을 알아봅니다.",
    date: "2023-05-10",
    category: "Design",
    slug: "responsive-design-with-tailwind",
    tags: ["Tailwind CSS", "반응형 디자인", "CSS", "웹 디자인"],
    image: "/placeholder.svg?height=400&width=800",
    author: "김철수",
    body: {
      code: "export default function MDXContent() { return <div><h1>Tailwind CSS로 반응형 디자인 구현하기</h1><p>이 글에서는 Tailwind CSS를 사용하여 반응형 디자인을 구현하는 방법을 알아봅니다.</p></div> }",
    },
  },
  {
    title: "TypeScript 타입 시스템 마스터하기",
    description:
      "TypeScript의 고급 타입 기능을 활용하여 더 안전하고 유지보수하기 쉬운 코드를 작성하는 방법을 알아봅니다.",
    date: "2023-05-05",
    category: "Development",
    slug: "mastering-typescript-types",
    tags: ["TypeScript", "JavaScript", "프로그래밍", "타입 시스템"],
    image: "/placeholder.svg?height=400&width=800",
    author: "박영희",
    body: {
      code: "export default function MDXContent() { return <div><h1>TypeScript 타입 시스템 마스터하기</h1><p>이 글에서는 TypeScript의 고급 타입 기능을 알아봅니다.</p></div> }",
    },
  },
  {
    title: "서버 컴포넌트와 클라이언트 컴포넌트의 차이점",
    description: "React 서버 컴포넌트와 클라이언트 컴포넌트의 차이점과 각각의 사용 사례를 알아봅니다.",
    date: "2023-04-28",
    category: "Development",
    slug: "server-vs-client-components",
    tags: ["React", "Next.js", "서버 컴포넌트", "클라이언트 컴포넌트"],
    image: "/placeholder.svg?height=400&width=800",
    author: "이민수",
    body: {
      code: "export default function MDXContent() { return <div><h1>서버 컴포넌트와 클라이언트 컴포넌트의 차이점</h1><p>이 글에서는 React 서버 컴포넌트와 클라이언트 컴포넌트의 차이점을 알아봅니다.</p></div> }",
    },
  },
  {
    title: "효과적인 상태 관리를 위한 Zustand 활용법",
    description: "React 애플리케이션에서 Zustand를 사용하여 상태를 효과적으로 관리하는 방법을 알아봅니다.",
    date: "2023-04-20",
    category: "Development",
    slug: "effective-state-management-with-zustand",
    tags: ["React", "Zustand", "상태 관리", "JavaScript"],
    image: "/placeholder.svg?height=400&width=800",
    author: "최지원",
    body: {
      code: "export default function MDXContent() { return <div><h1>효과적인 상태 관리를 위한 Zustand 활용법</h1><p>이 글에서는 Zustand를 사용한 상태 관리 방법을 알아봅니다.</p></div> }",
    },
  },
  {
    title: "웹 성능 최적화 기법 10가지",
    description: "웹사이트 로딩 속도와 사용자 경험을 향상시키는 10가지 성능 최적화 기법을 알아봅니다.",
    date: "2023-04-15",
    category: "Performance",
    slug: "web-performance-optimization-techniques",
    tags: ["웹 성능", "최적화", "사용자 경험", "프론트엔드"],
    image: "/placeholder.svg?height=400&width=800",
    author: "정성훈",
    body: {
      code: "export default function MDXContent() { return <div><h1>웹 성능 최적화 기법 10가지</h1><p>이 글에서는 웹사이트 성능을 최적화하는 10가지 방법을 알아봅니다.</p></div> }",
    },
  },
  {
    title: "AI를 활용한 콘텐츠 생성 전략",
    description: "인공지능 도구를 활용하여 효과적인 콘텐츠를 생성하고 마케팅에 활용하는 방법을 알아봅니다.",
    date: "2023-04-10",
    category: "AI",
    slug: "ai-content-generation-strategies",
    tags: ["AI", "콘텐츠 마케팅", "자동화", "생성형 AI"],
    image: "/placeholder.svg?height=400&width=800",
    author: "김태희",
    body: {
      code: "export default function MDXContent() { return <div><h1>AI를 활용한 콘텐츠 생성 전략</h1><p>이 글에서는 AI를 활용한 콘텐츠 생성 방법을 알아봅니다.</p></div> }",
    },
  },
]
