import Head from "next/head"

interface Tag {
  name: string;
  slug: string;
}

interface SEOSchemaProps {
  title: string
  description: string
  url: string
  imageUrl?: string
  type?: "article" | "website"
  publishedTime?: string
  modifiedTime?: string
  authorName?: string
  siteName?: string
  keywords?: string[] | Tag[]
}

function isTag(obj: any): obj is Tag {
  return obj && typeof obj === 'object' && 'name' in obj && 'slug' in obj;
}

export function SEOSchema({
  title,
  description,
  url,
  imageUrl,
  type = "article",
  publishedTime,
  modifiedTime,
  authorName,
  siteName = "InfoBox",
  keywords = [],
}: SEOSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": type === "article" ? "Article" : "WebPage",
    headline: title,
    description,
    url,
    ...(imageUrl && { image: [imageUrl] }),
    ...(publishedTime && { datePublished: publishedTime }),
    ...(modifiedTime && { dateModified: modifiedTime }),
    ...(authorName && {
      author: {
        "@type": "Person",
        name: authorName,
      },
    }),
    publisher: {
      "@type": "Organization",
      name: siteName,
      logo: {
        "@type": "ImageObject",
        url: `${url.split("/").slice(0, 3).join("/")}/logo.png`,
      },
    },
    ...(keywords.length > 0 && { 
      keywords: keywords.map(k => isTag(k) ? k.name : k).join(", ")
    }),
  }

  return (
    <Head>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
    </Head>
  )
}

// 이전 버전과의 호환성을 위해 SeoSchema도 내보냅니다
export const SeoSchema = SEOSchema
