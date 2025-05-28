import { DecoratorNode, LexicalNode, NodeKey, SerializedLexicalNode } from "lexical"
import * as React from "react"

export type SerializedImageNode = {
  altText: string
  src: string
  type: "image"
  version: 1
} & SerializedLexicalNode

function ImageComponent({ src, alt }: { src: string; alt: string }) {
  return (
    <div contentEditable={false} className="my-4">
      <img src={src} alt={alt} className="max-w-full h-auto rounded-lg" />
    </div>
  )
}

export class ImageNode extends DecoratorNode<JSX.Element> {
  __src: string
  __altText: string

  static getType() {
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

  createDOM(): HTMLElement {
    return document.createElement("div")
  }

  updateDOM(): false {
    return false
  }

  decorate(): JSX.Element {
    return <ImageComponent src={this.__src} alt={this.__altText} />
  }

  static importJSON(serializedNode: SerializedImageNode): ImageNode {
    const { src, altText } = serializedNode
    return new ImageNode(src, altText)
  }

  exportJSON(): SerializedImageNode {
    return {
      type: "image",
      version: 1,
      src: this.__src,
      altText: this.__altText,
    }
  }

  isInline(): boolean {
    return false
  }
} 

export function $createImageNode(src: string, altText = ""): ImageNode {
  return new ImageNode(src, altText)
}

export function $isImageNode(node: LexicalNode | null | undefined): node is ImageNode {
  return node instanceof ImageNode
} 