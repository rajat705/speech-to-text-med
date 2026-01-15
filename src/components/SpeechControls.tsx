import { Button } from "@/components/ui/button"
import { Mic, Square } from "lucide-react"

interface Props {
  listening: boolean
  onStart: () => void
  onStop: () => void
  onReset: () => void
  disabled?: boolean
}

export default function SpeechControls({
  listening,
  onStart,
  onStop,
  onReset,
  disabled = false,
}: Props) {
  return (
    <div className="flex gap-3">
      <Button
        onClick={listening ? onStop : onStart}
        disabled={disabled}
        variant={listening ? "destructive" : "default"}
      >
        {listening ? <Square className="w-4 h-4 mr-2" /> : <Mic className="w-4 h-4 mr-2" />}
        {listening ? "Stop Recording" : "Start Recording"}
      </Button>
      <Button variant="outline" onClick={onReset} disabled={disabled}>
        Clear
      </Button>
    </div>
  )
}
