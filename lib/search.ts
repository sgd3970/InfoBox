import type { Post } from "./models"
import clientPromise from "@/lib/mongodb";
import { Collection, Document, WithId } from "mongodb";

// contentlayer/generated에서 가져오는 allPosts 대신 사용할 모의 데이터
// const allPosts: Post[] = [
//   {
//     title: "Next.js와 MDX로 블로그 만들기",
//     description: "Next.js와 MDX를 활용하여 최신 블로그를 구축하는 방법을 알아봅니다.",
//     date: "2023-05-16",
//     category: "Development",
//     slug: "nextjs-mdx-blog",
//     tags: ["Next.js", "MDX", "React", "블로그"],
//     image: "/placeholder.svg?height=400&width=800",
//     author: "홍길동",
//     featured: true,
//     body: {
//       code: "export default function MDXContent() { return <div><h1>Next.js와 MDX로 블로그 만들기</h1><p>이 글에서는 Next.js와 MDX를 활용하여 블로그를 만드는 방법을 알아봅니다.</p></div> }",
//     },
//     views: 0,
//     createdAt: new Date(),
//     updatedAt: new Date(),
//   },\n//   // 다른 모의 데이터는 생략...
// ]

// 기본 검색 함수 - Update searchPosts or remove if not used elsewhere
export const searchPosts = async (searchTerm: string): Promise<Post[]> => {
  try {
    const client = await clientPromise;
    const db = client.db();
    const collection: Collection<Document> = db.collection("posts");

  if (!searchTerm) {
      // If no search term, return recent posts (e.g., limit 10)
      const posts = await collection.find().sort({ date: -1 }).limit(10).toArray();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return posts as unknown as Post[]; // Explicitly cast via unknown
  }

    const lowerSearchTerm = searchTerm.toLowerCase();

    // Implement text search or regex search based on searchTerm
    // This is a basic example using regex, consider full-text search for better results
    const posts = await collection.find({
      $or: [
        { title: { $regex: lowerSearchTerm, $options: 'i' } },
        { description: { $regex: lowerSearchTerm, $options: 'i' } },
        { category: { $regex: lowerSearchTerm, $options: 'i' } },
        { tags: { $elemMatch: { $regex: lowerSearchTerm, $options: 'i' } } },
      ]
    }).sort({ date: -1 }).toArray(); // Basic sort, relevance sorting is complex

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return posts as unknown as Post[]; // Explicitly cast via unknown

  } catch (error) {
    console.error("기본 검색 오류:", error);
    return [];
  }
};

// 고급 검색 옵션 타입
export interface SearchOptions {
  query: string
  category?: string
  tags?: string[]
  dateFrom?: string
  dateTo?: string
  sortBy?: "relevance" | "date" | "views"
  sortOrder?: "asc" | "desc"
  page?: number
  limit?: number
}

// 고급 검색 함수
export async function advancedSearch(options: SearchOptions): Promise<{
  posts: Post[]
  total: number
  page: number
  limit: number
  pages: number
}> {
  try {
    const {
      query,
      category,
      tags,
      dateFrom,
      dateTo,
      sortBy = "relevance",
      sortOrder = "desc",
      page = 1,
      limit = 10,
    } = options

    // MongoDB 연결 및 컬렉션 가져오기
    const client = await clientPromise;
    const db = client.db();
    const collection: Collection<Document> = db.collection("posts");

    // 쿼리 조건 구성
    const filter: any = {};

    if (query) {
      // Add text search or regex conditions for the query
       filter.$or = [
        { title: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        // Consider adding category and tag to query search if needed
      ];
    }

    if (category && category !== "all") {
      filter.category = { $regex: new RegExp(`^${category}$`, "i") };
    }

    if (tags && tags.length > 0) {
      filter.tags = { $in: tags };
    }

    if (dateFrom || dateTo) {
       const dateFilter: any = {};
       if (dateFrom) dateFilter.$gte = new Date(dateFrom);
       if (dateTo) dateFilter.$lte = new Date(dateTo);
       filter.date = dateFilter;
    }

    // 정렬 조건 구성
    const sort: any = {};
      if (sortBy === "date") {
      sort.date = sortOrder === "asc" ? 1 : -1;
      } else if (sortBy === "views") {
      sort.views = sortOrder === "asc" ? 1 : -1;
    } else {
      // Default or relevance sorting (basic example: date desc)
       sort.date = -1;
    }

    // 페이지네이션 계산
    const skip = (page - 1) * limit;

    // MongoDB 쿼리 실행
    const posts = await collection.find(filter).sort(sort).skip(skip).limit(limit).toArray();
    const total = await collection.countDocuments(filter);

    // 가져온 포스트 데이터 검증 및 보완
    const sanitizedPosts = posts.map(post => ({
      ...post,
      // 새로운 필드가 없을 경우 기본값 설정
      featuredImage: post.featuredImage === undefined ? null : post.featuredImage,
      images: Array.isArray(post.images) ? post.images : [],
      tags: Array.isArray(post.tags) ? post.tags : [], // tags 필드도 배열인지 확인
      views: post.views === undefined ? 0 : post.views, // views 필드 기본값 설정
      author: post.author === undefined ? "관리자" : post.author, // author 필드 기본값 설정
    }));

    return {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      posts: sanitizedPosts as unknown as Post[], // Explicitly cast via unknown
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    }
  } catch (error) {
    console.error("고급 검색 오류:", error)
    return {
      posts: [],
      total: 0,
      page: 1,
      limit: 10,
      pages: 0,
    }
  }
}

// 자동 완성 제안 가져오기 - Update to use MongoDB
export async function getSearchSuggestions(query: string, limit = 5): Promise<string[]> {
  try {
    const client = await clientPromise;
    const db = client.db();
    const collection: Collection<Document> = db.collection("posts");

    if (!query || query.trim().length < 2) {
      return [];
    }

    const lowerQuery = query.toLowerCase();

    // Use aggregation for suggestions
    const suggestions = await collection.aggregate<{
        _id: string;
        suggestions: string[];
    }>([
      { // Match documents that might contain the query in title, category, or tags
        $match: {
          $or: [
            { title: { $regex: lowerQuery, $options: 'i' } },
            { category: { $regex: lowerQuery, $options: 'i' } },
            { tags: { $elemMatch: { $regex: lowerQuery, $options: 'i' } } },
          ],
        },
      },
      { // Project potential suggestion fields
        $project: {
          title: 1,
          category: 1,
          tags: 1,
        },
      },
      { // Use $addFields to create an array of all potential suggestion strings
        $addFields: {
          allSuggestions: {
            $filter: {
              input: {
                 $concatArrays: [
                   ["$title"], // Include title
                   ["$category"], // Include category
                   "$tags", // Include tags
                 ].filter(Boolean) // Filter out null/undefined if any field is missing
              },
              as: "suggestion",
              cond: { // Filter for strings that contain the lowerQuery
                 $regexMatch: { input: { $toLower: "$$suggestion" }, regex: lowerQuery },
              },
            },
          },
        },
      },
      { // Unwind the allSuggestions array
        $unwind: "$allSuggestions",
      },
      { // Group to collect unique suggestions and limit
        $group: {
          _id: null,
          uniqueSuggestions: { $addToSet: "$allSuggestions" },
        },
      },
      { // Project just the unique suggestions array
        $project: {
          _id: 0,
          suggestions: { $slice: ["$uniqueSuggestions", limit] }, // Limit the number of suggestions
        },
      },
    ]).toArray();

    // Return the suggestions array from the result
    return suggestions[0]?.suggestions || [];

  } catch (error) {
    console.error("검색 제안 가져오기 오류:", error);
    return [];
  }
};
