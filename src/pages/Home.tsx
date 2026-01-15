import { useState, useCallback } from "react"
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition"
import SpeechControls from "@/components/SpeechControls"
import TextEditor from "@/components/TextEditor"

export default function Home() {
  const [editorData, setEditorData] = useState("")

  const handleTranscript = useCallback((text: string) => {
    setEditorData(prev => prev + text + " ")
  }, [])

  const {
    listening,
    startListening,
    stopListening,
    error,
    isInitializing,
    isUsingFallback,
  } = useSpeechRecognition(handleTranscript)

  const handleReset = () => {
    setEditorData("")
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-semibold">
        Speech to Text
      </h1>

      <SpeechControls
        listening={listening}
        onStart={startListening}
        onStop={stopListening}
        onReset={handleReset}
        disabled={isInitializing}
      />

      <TextEditor
        value={editorData}
        onChange={setEditorData}
      />
    </div>
  )
}
