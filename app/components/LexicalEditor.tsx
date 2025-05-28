import { useEffect } from "react"
import { LexicalComposer } from "@lexical/react/LexicalComposer"
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin"
import { ContentEditable } from "@lexical/react/LexicalContentEditable"
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin"
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin"
import { $generateHtmlFromNodes } from "@lexical/html"
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext"
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary"
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin"
import { $getRoot, $getSelection } from "lexical"
import { useCallback } from "react"
import { LexicalTypeaheadMenuPlugin } from "@lexical/react/LexicalTypeaheadMenuPlugin"
import { INSERT_IMAGE_COMMAND } from "./plugins/ImagePlugin"
import ImagePlugin from "./plugins/ImagePlugin"

const editorConfig = {
  namespace: "LexicalEditor",
  onError(error: Error) {
    throw error
  },
  nodes: [],
  theme: {
    paragraph: "mb-2",
  },
}

function HtmlChangePlugin({ onHtmlChange }: { onHtmlChange: (html: string) => void }) {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const html = $generateHtmlFromNodes(editor, null)
        onHtmlChange(html)
      })
    })
  }, [editor, onHtmlChange])

  return null
}

export default function LexicalEditor({ onHtmlChange }: { onHtmlChange: (html: string) => void }) {
  return (
    <LexicalComposer initialConfig={editorConfig}>
      <div className="border rounded-xl p-4 min-h-[300px]">
        <RichTextPlugin
          contentEditable={<ContentEditable className="outline-none min-h-[200px]" />}
          placeholder={null}
          ErrorBoundary={LexicalErrorBoundary}
        />
        <HistoryPlugin />
        <AutoFocusPlugin />
        <HtmlChangePlugin onHtmlChange={onHtmlChange} />
        <ImagePlugin />
      </div>
    </LexicalComposer>
  )
} 