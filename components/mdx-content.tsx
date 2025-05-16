import { useMDXComponent } from "next-contentlayer/hooks"
import { useMDXComponents } from "@/mdx-components"

interface MdxContentProps {
  code: string
}

export function MdxContent({ code }: MdxContentProps) {
  const MDXComponent = useMDXComponent(code)
  const components = useMDXComponents({})

  return <MDXComponent components={components} />
}
