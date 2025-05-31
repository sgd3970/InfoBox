import { defineDocumentType, makeSource } from "contentlayer/source-files"
import rehypePrettyCode from "rehype-pretty-code"
import rehypeSlug from "rehype-slug"
import remarkGfm from "remark-gfm"

export const Post = defineDocumentType(() => ({
  name: "Post",
  filePathPattern: `posts/**/*.mdx`,
  contentType: "mdx",
  fields: {
    title: { type: "string", required: true },
    description: { type: "string", required: true },
    date: { type: "date", required: true },
    category: { type: "string", required: true },
    slug: { type: "string", required: true },
    image: { type: "string", required: false },
    images: { type: "list", of: { type: "string" }, required: false },
    featuredImage: { type: "string", required: false },
    author: { type: "string", required: false },
    authorId: { type: "string", required: false },
    featured: { type: "boolean", default: false },
    views: { type: "number", required: false },
    readingTime: { type: "number", required: false },
    content: { type: "mdx", required: true },
  },
  computedFields: {
    slug: {
      type: "string",
      resolve: (doc) => doc._raw.flattenedPath.replace("posts/", ""),
    },
    url: {
      type: "string",
      resolve: (post) => {
        const category = typeof post.category === 'string' ? post.category.toLowerCase() : post.category?.slug.toLowerCase()
        const slug = post._raw.flattenedPath.replace("posts/", "")
        return `/blog/${category}/${slug}`
      },
    },

  },
}))

export default makeSource({
  contentDirPath: "content",
  documentTypes: [Post],
  mdx: {
    remarkPlugins: [remarkGfm],
    rehypePlugins: [
      rehypeSlug,
      [
        rehypePrettyCode as any,
        {
          theme: "github-dark",
          onVisitLine(node: any) {
            // Prevent lines from collapsing in `display: grid` mode
            if (node.children.length === 0) {
              node.children = [{ type: "text", value: " " }]
            }
          },
          onVisitHighlightedLine(node: any) {
            node.properties.className.push("line--highlighted")
          },
          onVisitHighlightedWord(node: any) {
            node.properties.className = ["word--highlighted"]
          },
        },
      ],
    ],
  },
})
