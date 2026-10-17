import { useEffect, useRef, useState } from "react"
import axios from "axios"
import { GoogleGenAI } from "@google/genai"
import { auth } from "../../firebase/firebase"
import ResumeUploader from "../resume/ResumeUploader"
import InterviewFeedback from "./InterviewFeedback"
import "../../styles/voiceInterview.css"

const QUESTION_COUNTS = [5, 8, 10]
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api"

const MODE_OPTIONS = [
  {
    value: "resume_based",
    label: "Resume-based",
    description: "Explore your projects, experience, and skills."
  },
  {
    value: "role_based",
    label: "Role / JD-based",
    description: "Practice questions tailored to a target role and job description."
  }
]

function VoiceInterview() {
  const [mode, setMode] = useState("resume_based")
  const [role, setRole] = useState("")
  const [resumeFile, setResumeFile] = useState(null)
  const [jobDescription, setJobDescription] = useState("")
  const [questionCount, setQuestionCount] = useState(5)
  const [focus, setFocus] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [starting, setStarting] = useState(false)
  const [interviewId, setInterviewId] = useState("")
  const [error, setError] = useState("")

  const needsResume = true
  const needsRole = mode === "role_based"

  async function handleSubmit(event) {
    event.preventDefault()
    setError("")

    if (mode === "resume_based" && !resumeFile) {
      setError("Upload your resume before starting a resume-based interview.")
      return
    }

    if (needsRole && !role.trim()) {
      setError("Add a target role before starting a role-based interview.")
      return
    }

    const user = auth.currentUser
    if (!user) {
      setError("Please sign in before starting a voice interview.")
      return
    }

    setStarting(true)
    try {
      const idToken = await user.getIdToken()
      const formData = new FormData()
      formData.append("mode", mode)
      formData.append("role", role.trim())
      formData.append("jobDescription", jobDescription.trim())
      formData.append("questionCount", String(questionCount))
      formData.append("focus", focus.trim())
      if (resumeFile) formData.append("resume", resumeFile)

      const response = await axios.post(`${API_BASE_URL}/interview/start`, formData, {
        headers: { Authorization: `Bearer ${idToken}` }
      })

      setInterviewId(response.data.interview.id)
      setSubmitted(true)
    } catch (requestError) {
      setError(requestError.response?.data?.error || "Unable to create the interview session.")
    } finally {
      setStarting(false)
    }
  }

  function handleModeChange(nextMode) {
    setMode(nextMode)
    setSubmitted(false)
    setError("")
  }

  function handleResumeFileSelect(file) {
    setResumeFile(file)
    setError("")
    setSubmitted(false)
  }

  if (submitted) {
    return (
      <main className="voice-interview-page voice-live-page">
        <InterviewRoom interviewId={interviewId} onError={setError} />
      </main>
    )
  }

  return (
    <main className="voice-interview-page">
      <section className="voice-interview-intro">
        <p className="voice-kicker">Practice out loud</p>
        <h1>Voice Mock Interview</h1>
        <p>
          Set the direction for a focused, conversational interview. Your microphone
          and interviewer session will be connected after setup is complete.
        </p>
      </section>

      <form className="voice-interview-form" onSubmit={handleSubmit}>
        <div className="voice-form-section">
          <div className="voice-section-heading">
            <span className="voice-step">01</span>
            <div>
              <h2>Choose your interview context</h2>
              <p>The interviewer will use this context to shape its questions.</p>
            </div>
          </div>

          <div className="voice-mode-grid">
            {MODE_OPTIONS.map((option) => (
              <button
                type="button"
                key={option.value}
                className={`voice-mode-option ${mode === option.value ? "selected" : ""}`}
                onClick={() => handleModeChange(option.value)}
              >
                <span className="voice-mode-radio" aria-hidden="true" />
                <strong>{option.label}</strong>
                <span>{option.description}</span>
              </button>
            ))}
          </div>

          <div className="voice-input-grid">
            {needsRole && (
              <label>
                Target role
                <input
                  value={role}
                  onChange={(event) => setRole(event.target.value)}
                  placeholder="e.g. Backend Engineer"
                />
              </label>
            )}

            {needsResume && (
              <label className="voice-wide-field">
                Resume file {mode === "resume_based" ? "(required)" : "(optional)"}
                <ResumeUploader
                  file={resumeFile}
                  onFileSelect={handleResumeFileSelect}
                  onRemoveFile={() => setResumeFile(null)}
                />
              </label>
            )}

            {needsRole && (
              <label className="voice-wide-field">
                Job description (optional)
                <textarea
                  value={jobDescription}
                  onChange={(event) => setJobDescription(event.target.value)}
                  placeholder="Paste the role or job description here."
                  rows={6}
                />
              </label>
            )}
          </div>
        </div>

        <div className="voice-form-section voice-preferences-section">
          <div className="voice-section-heading">
            <span className="voice-step">02</span>
            <div>
              <h2>Set the interview focus</h2>
              <p>Keep the session bounded and make the practice relevant to you.</p>
            </div>
          </div>

          <div className="voice-preferences-grid">
            <label>
              Number of questions
              <select value={questionCount} onChange={(event) => setQuestionCount(Number(event.target.value))}>
                {QUESTION_COUNTS.map((count) => <option key={count} value={count}>{count} questions</option>)}
              </select>
            </label>

            <label>
              What would you like to focus on in this interview?
              <textarea
                value={focus}
                onChange={(event) => setFocus(event.target.value)}
                placeholder="e.g. Focus on Java, Spring Boot, backend development and my Finora project."
                rows={4}
              />
            </label>
          </div>
        </div>

        {error && <p className="voice-form-error" role="alert">{error}</p>}

        <div className="voice-form-actions">
          <div>
            <span className="voice-action-label">Ready when you are</span>
            <span className="voice-action-note">{questionCount} questions · voice-only session</span>
          </div>
          <button className="voice-start-button" type="submit" disabled={starting}>
            {starting ? "Creating session..." : "Create interview"} <span aria-hidden="true">→</span>
          </button>
        </div>
      </form>

    </main>
  )
}

function bytesToBase64(bytes) {
  let binary = ""
  bytes.forEach((byte) => { binary += String.fromCharCode(byte) })
  return btoa(binary)
}

function base64ToBytes(value) {
  const binary = atob(value)
  return Uint8Array.from(binary, (character) => character.charCodeAt(0))
}

function floatToPcm16(samples, sampleRate) {
  const targetRate = 16000
  const ratio = sampleRate / targetRate
  const pcm = new Int16Array(Math.max(1, Math.round(samples.length / ratio)))
  for (let index = 0; index < pcm.length; index += 1) {
    const sample = samples[Math.min(samples.length - 1, Math.floor(index * ratio))]
    const clamped = Math.max(-1, Math.min(1, sample))
    pcm[index] = clamped < 0 ? clamped * 32768 : clamped * 32767
  }
  return new Uint8Array(pcm.buffer)
}

function InterviewRoom({ interviewId, onError }) {
  const [status, setStatus] = useState("idle")
  const [transcript, setTranscript] = useState("")
  const [currentQuestion, setCurrentQuestion] = useState("")
  const [answerTimeLeft, setAnswerTimeLeft] = useState(null)
  const [endedInterview, setEndedInterview] = useState(null)
  const [roomError, setRoomError] = useState("")
  const geminiRef = useRef(null)
  const streamRef = useRef(null)
  const audioContextRef = useRef(null)
  const sourceRef = useRef(null)
  const processorRef = useRef(null)
  const playbackContextRef = useRef(null)
  const playbackTimeRef = useRef(0)
  const playbackSourcesRef = useRef(new Set())
  const answerStartedRef = useRef(null)
  const transcriptBufferRef = useRef("")
  const questionBufferRef = useRef("")
  const currentQuestionRef = useRef(false)
  const answerTimerRef = useRef(null)
  const answerFinalizingRef = useRef(false)
  const turnCompletePendingRef = useRef(false)
  const answerFinalizationTimerRef = useRef(null)

  const reportError = (message) => {
    cleanupRoom()
    setRoomError(message)
    onError(message)
    setStatus("error")
  }

  async function authHeaders() {
    const user = auth.currentUser
    if (!user) throw new Error("Please sign in before starting the interview.")
    return { Authorization: `Bearer ${await user.getIdToken()}` }
  }

  async function requestJson(path, options = {}) {
    const headers = await authHeaders()
    const response = await axios({
      url: `${API_BASE_URL}${path}`,
      ...options,
      headers: { ...headers, ...(options.headers || {}) }
    })
    return response.data
  }

  async function startRoom() {
    if (status === "connecting" || status === "live") return
    try {
      setRoomError("")
      setStatus("connecting")
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      const { token, model } = await requestJson(`/interview/${interviewId}/gemini-token`, { method: "POST" })
      const ai = new GoogleGenAI({ apiKey: token })
      const gemini = await ai.live.connect({
        model,
        config: {
          responseModalities: ["AUDIO"],
          inputAudioTranscription: {},
          outputAudioTranscription: {},
        },
        callbacks: {
          onmessage: handleGeminiEvent,
          onerror: (event) => {
            console.error("Gemini Live error:", event)
            reportError(event?.message || "Gemini Live connection failed.")
          },
          onclose: (event) => {
            if (geminiRef.current === gemini) {
              console.error("Gemini Live closed:", event?.code, event?.reason)
              reportError("The Gemini Live session disconnected. Please restart the interview.")
            }
          },
        },
      })
      geminiRef.current = gemini
      setStatus("live")
      gemini.sendClientContent({
        turns: [{ role: "user", parts: [{ text: "Begin the interview now." }] }],
        turnComplete: true,
      })

      const audioContext = new AudioContext({ sampleRate: 16000 })
      audioContextRef.current = audioContext
      const source = audioContext.createMediaStreamSource(stream)
      const processor = audioContext.createScriptProcessor(4096, 1, 1)
      sourceRef.current = source
      processorRef.current = processor
      processor.onaudioprocess = (event) => {
        if (geminiRef.current !== gemini) return
        event.outputBuffer.getChannelData(0).fill(0)
        const input = event.inputBuffer.getChannelData(0)
        const pcm = floatToPcm16(input, audioContext.sampleRate)
        gemini.sendRealtimeInput({
          audio: { data: bytesToBase64(pcm), mimeType: "audio/pcm;rate=16000" },
        })
      }
      source.connect(processor)
      processor.connect(audioContext.destination)
    } catch (error) {
      cleanupRoom()
      reportError(error.response?.data?.error || error.message || "Unable to start the voice interview.")
    }
  }

  function scheduleAnswerFinalization() {
    clearTimeout(answerFinalizationTimerRef.current)
    answerFinalizationTimerRef.current = setTimeout(() => {
      if (currentQuestionRef.current && transcriptBufferRef.current.trim()) {
        finalizeAnswer()
      }
    }, 500)
  }

  function handleGeminiEvent(event) {
    const content = event.serverContent
    if (!content) return
    if (content.interrupted) {
      stopPlayback()
    }
    const outputText = content.outputTranscription?.text?.trim()
    if (outputText) {
      questionBufferRef.current = `${questionBufferRef.current} ${outputText}`.trim()
      setCurrentQuestion(questionBufferRef.current)
      if (content.outputTranscription.finished) recordQuestion(questionBufferRef.current)
    }
    const inputText = content.inputTranscription?.text?.trim()
    if (inputText) {
      if (!answerStartedRef.current) {
        answerStartedRef.current = new Date().toISOString()
        startAnswerTimer()
      }
      transcriptBufferRef.current = `${transcriptBufferRef.current} ${inputText}`.trim()
      setTranscript(transcriptBufferRef.current)
      if (turnCompletePendingRef.current && currentQuestionRef.current && transcriptBufferRef.current.trim()) {
        turnCompletePendingRef.current = false
        clearTimeout(answerFinalizationTimerRef.current)
        finalizeAnswer()
      }
    }
    try {
      for (const part of content.modelTurn?.parts || []) {
        if (part.inlineData?.data) queueAudio(part.inlineData.data)
      }
    } catch {
      reportError("Audio playback failed. Please restart the interview.")
    }
    if (content.turnComplete) {
      turnCompletePendingRef.current = true
      if (!currentQuestionRef.current && questionBufferRef.current) {
        recordQuestion(questionBufferRef.current)
      } else if (currentQuestionRef.current && transcriptBufferRef.current.trim()) {
        turnCompletePendingRef.current = false
        finalizeAnswer()
      } else {
        scheduleAnswerFinalization()
      }
    }
  }

  function recordQuestion(question) {
    if (!question || currentQuestionRef.current) return
    currentQuestionRef.current = true
    questionBufferRef.current = ""
    turnCompletePendingRef.current = false
    clearTimeout(answerFinalizationTimerRef.current)
    setCurrentQuestion(question)
    requestJson(`/interview/${interviewId}/question`, {
      method: "POST",
      data: { question, askedAt: new Date().toISOString() }
    }).catch((error) => reportError(error.response?.data?.error || "Unable to record the interview question."))
  }

  function startAnswerTimer() {
    clearInterval(answerTimerRef.current)
    setAnswerTimeLeft(300)
    answerTimerRef.current = setInterval(() => {
      setAnswerTimeLeft((timeLeft) => {
        if (timeLeft === null || timeLeft <= 1) {
          clearInterval(answerTimerRef.current)
          finalizeAnswer(true, true)
          return 0
        }
        return timeLeft - 1
      })
    }, 1000)
  }

  function queueAudio(encodedAudio) {
    const audioContext = playbackContextRef.current || new AudioContext({ sampleRate: 24000 })
    playbackContextRef.current = audioContext
    const bytes = base64ToBytes(encodedAudio)
    const samples = new Int16Array(bytes.buffer, bytes.byteOffset, Math.floor(bytes.byteLength / 2))
    const buffer = audioContext.createBuffer(1, samples.length, 24000)
    const channel = buffer.getChannelData(0)
    samples.forEach((sample, index) => { channel[index] = sample / 32768 })
    const source = audioContext.createBufferSource()
    source.buffer = buffer
    source.connect(audioContext.destination)
    playbackSourcesRef.current.add(source)
    source.onended = () => playbackSourcesRef.current.delete(source)
    const startAt = Math.max(audioContext.currentTime, playbackTimeRef.current)
    source.start(startAt)
    playbackTimeRef.current = startAt + buffer.duration
  }

  function stopPlayback() {
    for (const source of playbackSourcesRef.current) {
      try { source.stop() } catch { /* The chunk may already have ended. */ }
    }
    playbackSourcesRef.current.clear()
    playbackTimeRef.current = playbackContextRef.current?.currentTime || 0
  }

  async function finalizeAnswer(autoEnd = true, timedOut = false) {
    if (answerFinalizingRef.current) return
    const answer = transcriptBufferRef.current.trim()
    if ((!answer && !timedOut) || !currentQuestionRef.current) return

    answerFinalizingRef.current = true
    turnCompletePendingRef.current = false
    clearTimeout(answerFinalizationTimerRef.current)

    const answerStartedAt = answerStartedRef.current || new Date().toISOString()
    const answerEndedAt = new Date().toISOString()
    try {
      const result = await requestJson(`/interview/${interviewId}/answer`, {
        method: "POST",
        data: { answer, answerStartedAt, answerEndedAt, timedOut }
      })
      transcriptBufferRef.current = ""
      answerStartedRef.current = null
      clearInterval(answerTimerRef.current)
      setAnswerTimeLeft(null)
      setTranscript("")
      currentQuestionRef.current = false
      if (result.questionCountReached && autoEnd) await endRoom()
    } catch (error) {
      reportError(error.response?.data?.error || "Unable to save the transcript.")
    } finally {
      answerFinalizingRef.current = false
    }
  }

  async function endRoom() {
    try {
      await finalizeAnswer(false)
      const result = await requestJson(`/interview/${interviewId}/end`, { method: "POST" })
      cleanupRoom()
      setEndedInterview(result.interview)
      setStatus("complete")
    } catch (error) {
      reportError(error.response?.data?.error || "Unable to complete the interview.")
    }
  }

  function cleanupRoom() {
    clearInterval(answerTimerRef.current)
    clearTimeout(answerFinalizationTimerRef.current)
    if (processorRef.current) processorRef.current.disconnect()
    if (sourceRef.current) sourceRef.current.disconnect()
    if (audioContextRef.current) audioContextRef.current.close().catch(() => {})
    stopPlayback()
    if (playbackContextRef.current) playbackContextRef.current.close().catch(() => {})
    const gemini = geminiRef.current
    geminiRef.current = null
    if (gemini) gemini.close()
    if (streamRef.current) streamRef.current.getTracks().forEach((track) => track.stop())
    processorRef.current = null
    sourceRef.current = null
    audioContextRef.current = null
    playbackContextRef.current = null
    streamRef.current = null
    answerTimerRef.current = null
    answerFinalizationTimerRef.current = null
    answerFinalizingRef.current = false
    turnCompletePendingRef.current = false
  }

  useEffect(() => () => cleanupRoom(), [])

  if (endedInterview) return <InterviewFeedback interview={endedInterview} />

  return (
    <section className="voice-room-panel" aria-live="polite">
      <div className="voice-room-header">
        <div>
          <p className="voice-kicker">Live session</p>
          <h2>{status === "live" ? "Interview in progress" : "Ready to begin"}</h2>
        </div>
        <span className={`voice-status-pill ${status}`}>{status}</span>
      </div>
      <p className="voice-room-copy">The interviewer will speak first. Answer naturally; your finalized speech is transcribed for feedback.</p>
      <div className="voice-interviewer-card">
        <div className="voice-interviewer-avatar" aria-hidden="true">🤖</div>
        <div>
          <span className="voice-interviewer-label">Interviewer</span>
          <p>{currentQuestion || "Your interviewer will ask the first question after the session connects."}</p>
        </div>
      </div>
      {answerTimeLeft !== null && <p className="voice-answer-timer">Answer time remaining: {Math.floor(answerTimeLeft / 60)}:{String(answerTimeLeft % 60).padStart(2, "0")}</p>}
      {transcript && <div className="voice-transcript"><span>Live transcript</span><p>{transcript}</p></div>}
      {roomError && <p className="voice-form-error" role="alert">{roomError}</p>}
      <div className="voice-room-actions">
        {status !== "live" && status !== "complete" && <button className="voice-start-button" onClick={startRoom} disabled={status === "connecting"}>{status === "connecting" ? "Connecting..." : "Start voice interview"}</button>}
        {status === "live" && <button className="voice-end-button" onClick={endRoom}>End interview</button>}
      </div>
    </section>
  )
}

export default VoiceInterview