import { DecoratorNode, EditorConfig, LexicalEditor, NodeKey, SerializedLexicalNode, Spread } from "lexical"
import * as React from "react"

export type SerializedImageNode = Spread<
  {
    src: string
    altText: string
    type: "image"
    version: 1
  },
  SerializedLexicalNode
>

function ImageComponent({ src, alt }: { src: string; alt: string }) {
  return (
    <div contentEditable={false} className="my-4">
      <img src={src} alt={alt} className="max-w-full h-auto rounded-lg" />
    </div>
  )
}

export class ImageNode extends DecoratorNode<React.ReactElement> {
  __src: string
  __altText: string

  static getType(): string {
    return "image"
  }

  static clone(node: ImageNode): ImageNode {
    return new ImageNode(node.__src, node.__altText, node.__key)
  }

  constructor(src: string, altText: string, key?: NodeKey) {
    super(key)
    this.__src = src
    this.__altText = altText
  }

  createDOM(config: EditorConfig): HTMLElement {
    const span = document.createElement("span")
    const theme = config.theme
    const className = theme.image
    if (className !== undefined) {
      span.className = className
    }
    return span
  }

  updateDOM(): false {
    return false
  }

  getSrc(): string {
    return this.__src
  }

  getAltText(): string {
    return this.__altText
  }

  decorate(): React.ReactElement {
    return <ImageComponent src={this.__src} alt={this.__altText} />
  }

  isIsolated(): boolean {
    return true
  }

  static importJSON(serializedNode: SerializedImageNode): ImageNode {
    const { src, altText } = serializedNode
    const node = $createImageNode(src, altText)
    return node
  }

  exportJSON(): SerializedImageNode {
    return {
      altText: this.getAltText(),
      src: this.getSrc(),
      type: "image",
      version: 1,
    }
  }

  isInline(): boolean {
    return false
  }
}

export function $createImageNode(src: string, altText: string): ImageNode {
  return new ImageNode(src, altText)
}

export function $isImageNode(node: any): node is ImageNode {
  return node instanceof ImageNode
} 