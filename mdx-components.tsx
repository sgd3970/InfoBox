import type { MDXComponents } from "mdx/types"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { Callout } from "@/components/ui/callout"
import { CodeBlock } from "@/components/ui/code-block"
import { TOC } from "@/components/toc"

// Custom components for MDX
export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    // Override base components
    h1: ({ className, ...props }) => (
      <h1 className={cn("mt-8 mb-4 text-4xl font-bold tracking-tight", className)} {...props} />
    ),
    h2: ({ className, ...props }) => (
      <h2
        id={props.children?.toString().toLowerCase().replace(/\s+/g, "-")}
        className={cn("mt-10 mb-4 text-3xl font-bold tracking-tight scroll-mt-20", className)}
        {...props}
      />
    ),
    h3: ({ className, ...props }) => (
      <h3
        id={props.children?.toString().toLowerCase().replace(/\s+/g, "-")}
        className={cn("mt-8 mb-4 text-2xl font-bold tracking-tight scroll-mt-20", className)}
        {...props}
      />
    ),
    p: ({ className, ...props }) => <p className={cn("leading-7 [&:not(:first-child)]:mt-6", className)} {...props} />,
    ul: ({ className, ...props }) => <ul className={cn("my-6 ml-6 list-disc", className)} {...props} />,
    ol: ({ className, ...props }) => <ol className={cn("my-6 ml-6 list-decimal", className)} {...props} />,
    blockquote: ({ className, ...props }) => (
      <blockquote className={cn("mt-6 border-l-2 pl-6 italic", className)} {...props} />
    ),
    img: ({ className, alt, ...props }) => (
      // Using Next.js Image for optimization
      <Image
        className={cn("rounded-md border", className)}
        alt={alt || ""}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        {...props}
      />
    ),
    // Custom components
    Callout: Callout,
    CodeBlock: CodeBlock,
    TOC: TOC,
    ...components,
  }
}
