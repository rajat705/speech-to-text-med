import { useEffect, useRef, useState, useCallback } from "react"
import * as Moonshine from "@moonshine-ai/moonshine-js"

export function useSpeechRecognition(onTranscript?: (text: string) => void) {
  const recognitionRef = useRef<any>(null)
  const [listening, setListening] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isInitializing, setIsInitializing] = useState(true)
  const [useFallback, setUseFallback] = useState(true)

  useEffect(() => {
    if (!onTranscript) {
      setIsInitializing(false)
      return
    }

    const initializeRecognition = async () => {
      try {
        console.log("Checking if Moonshine is available...")
        if (!Moonshine) {
          throw new Error("Moonshine JS not loaded")
        }

        console.log("Available Moonshine classes:", Object.keys(Moonshine))

        if (Moonshine.MicrophoneTranscriber && !useFallback) {
          console.log("Using MicrophoneTranscriber...")
          const transcriber = new Moonshine.MicrophoneTranscriber(
            "model/tiny", 
            {
              onTranscriptionCommitted: (text: string) => {
                console.log("Moonshine transcription:", JSON.stringify(text))

                const isReasonable = text && text.length > 1 && text.length < 100 &&
                  /[a-zA-Z]{3,}/.test(text) && 
                  !/[\u0080-\uFFFF]/.test(text) 

                if (isReasonable) {
                  console.log("Using Moonshine transcription:", text)
                  onTranscript(text)
                } else {
                  console.log("Moonshine transcription looks garbled, switching to browser fallback")
                  setUseFallback(true)
                  setError("Moonshine produced garbled text, switching to browser speech recognition")
                }
              },
              onTranscriptionUpdated: (text: string) => {
                console.log("Moonshine updated:", text)
              }
            },
            true 
          )

          recognitionRef.current = transcriber
          console.log("Moonshine MicrophoneTranscriber initialized")
        } else {
          console.log("Using browser Speech Recognition fallback")
          const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition

          if (!SpeechRecognition) {
            throw new Error("Speech recognition not supported in this browser")
          }

          const recognition = new SpeechRecognition()
          recognition.continuous = true
          recognition.interimResults = true
          recognition.lang = "en-US"

          recognition.onstart = () => {
            console.log("Browser speech recognition started")
            setListening(true)
          }

          recognition.onend = () => {
            console.log("Browser speech recognition ended")
            setListening(false)
          }

          recognition.onresult = (event: any) => {
            let finalText = ""
            for (let i = event.resultIndex; i < event.results.length; i++) {
              const result = event.results[i]
              if (result.isFinal) {
                finalText += result[0].transcript + " "
              }
            }

            if (finalText) {
              console.log("Browser transcription:", finalText.trim())
              onTranscript(finalText.trim())
            }
          }

          recognition.onerror = (event: any) => {
            console.error("Browser speech recognition error:", event)
            setError(`Speech recognition error: ${event.error}`)
          }

          recognitionRef.current = recognition
          console.log("Browser Speech Recognition initialized")
        }

        if (!useFallback && Moonshine.MoonshineSpeechRecognition) {
          console.log("Using MoonshineSpeechRecognition...")
          const recognition = new Moonshine.MoonshineSpeechRecognition()
          recognition.continuous = true
          recognition.interimResults = true
          recognition.lang = "en-US"

          recognition.addEventListener("start", () => {
            console.log("Speech recognition started")
            setListening(true)
          })

          recognition.addEventListener("end", () => {
            console.log("Speech recognition ended")
            setListening(false)
          })

          recognition.addEventListener("result", (event: any) => {
            console.log("Speech recognition result event:", event)
            try {
              if (event.results && event.results[0] && event.results[0][0] && event.results[0][0].transcript) {
                const transcript = event.results[0][0].transcript
                console.log("Transcript from Moonshine:", transcript)
                onTranscript(transcript)
              } else {
                console.log("No transcript found in result event")
              }
            } catch (err) {
              console.error("Error processing result event:", err)
            }
          })

          recognition.addEventListener("error", (event: any) => {
            console.error("Speech recognition error:", event)
            setError(`Speech recognition error: ${event.error || 'Unknown error'}`)
          })

          recognitionRef.current = recognition
          console.log("MoonshineSpeechRecognition initialized successfully")
        } else {
          throw new Error("No compatible Moonshine speech recognition class found")
        }

        setError(null)
        setIsInitializing(false)
      } catch (err) {
        console.error("Failed to initialize Moonshine speech recognition:", err)
        setError(`Failed to initialize speech recognition: ${err}`)
        setIsInitializing(false)
      }
    }

    initializeRecognition()
  }, [onTranscript, useFallback])

  const startListening = useCallback(() => {
    if (isInitializing) {
      setError("Speech recognition is still initializing...")
      return
    }

    if (recognitionRef.current) {
      try {
        console.log("Starting speech recognition...")
        recognitionRef.current.start()
        if (recognitionRef.current.constructor.name === 'MoonshineSpeechRecognition') {
        } else {
          setListening(true)
        }
        setError(null)
      } catch (err) {
        console.error("Failed to start listening:", err)
        setError("Failed to start speech recognition")
      }
    } else {
      setError("Speech recognition not initialized")
    }
  }, [isInitializing])

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        console.log("Stopping speech recognition...")
        recognitionRef.current.stop()
        if (recognitionRef.current.constructor.name === 'MoonshineSpeechRecognition') {
        } else {
          setListening(false)
        }
      } catch (err) {
        console.error("Failed to stop listening:", err)
      }
    }
  }, [])

  return {
    listening,
    startListening,
    stopListening,
    error,
    isInitializing,
    isUsingFallback: useFallback,
  }
}
