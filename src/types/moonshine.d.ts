declare module "@moonshine-ai/moonshine-js" {
  export class MicrophoneTranscriber {
    constructor(model: string, callbacks: {
      onTranscriptionCommitted?: (text: string) => void
      onTranscriptionUpdated?: (text: string) => void
    }, vadMode?: boolean)
    start(): void
    stop(): void
  }

  export class MoonshineSpeechRecognition extends EventTarget {
    continuous: boolean
    interimResults: boolean
    lang: string
    start(): void
    stop(): void
  }
}