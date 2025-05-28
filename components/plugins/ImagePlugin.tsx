import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext"
import { $insertNodes } from "lexical"
import { $createImageNode } from "./ImageNode"
import { useCallback } from "react"

export default function ImagePlugin() {
  const [editor] = useLexicalComposerContext()

  const insertImage = useCallback(
    (base64: string) => {
      editor.update(() => {
        const imageNode = $createImageNode(base64, "업로드된 이미지")
        $insertNodes([imageNode])
      })
    },
    [editor]
  )

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      const base64 = reader.result as string
      insertImage(base64)
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="mt-2">
      <input type="file" accept="image/*" onChange={handleFileChange} />
    </div>
  )
} 