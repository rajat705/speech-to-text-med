import { CKEditor } from "@ckeditor/ckeditor5-react"
import ClassicEditor from "@ckeditor/ckeditor5-build-classic"

interface Props {
  value: string
  onChange: (value: string) => void
}

export default function TextEditor({ value, onChange }: Props) {
  return (
    <div className="border rounded-md">
      <CKEditor
        editor={ClassicEditor as any}
        data={value}
        onChange={(_, editor) => {
          onChange(editor.getData())
        }}
      />
    </div>
  )
}
