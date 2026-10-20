import { useEffect, useRef, useState } from "react";
import { GoogleGenAI, Modality } from "@google/genai";
import { Bot, Mic2, Square } from "lucide-react";
import { apiError } from "../../services/api/client";
import { endInterview, getGeminiToken, getInterview, recordInterviewAnswer, recordInterviewQuestion } from "../../services/api/interviewApi";
import InterviewFeedback, { InterviewFeedbackData } from "./InterviewFeedback";

type RoomStatus = "idle" | "connecting" | "live" | "complete" | "error";

function toBase64(bytes: Uint8Array) {
  let value = "";
  bytes.forEach((byte) => { value += String.fromCharCode(byte); });
  return btoa(value);
}

function fromBase64(value: string) {
  const binary = atob(value);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

function toPcm16(samples: Float32Array, sampleRate: number) {
  const ratio = sampleRate / 16000;
  const pcm = new Int16Array(Math.max(1, Math.round(samples.length / ratio)));
  for (let index = 0; index < pcm.length; index += 1) {
    const sample = Math.max(-1, Math.min(1, samples[Math.min(samples.length - 1, Math.floor(index * ratio))]));
    pcm[index] = sample < 0 ? sample * 32768 : sample * 32767;
  }
  return new Uint8Array(pcm.buffer);
}

export default function InterviewRoom({ interviewId, onReset }: { interviewId: string; onReset: () => void }) {
  const [status, setStatus] = useState<RoomStatus>("idle");
  const [question, setQuestion] = useState("");
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState<Record<string, unknown> | null>(null);
  const geminiRef = useRef<Awaited<ReturnType<GoogleGenAI["live"]["connect"]>> | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const inputContextRef = useRef<AudioContext | null>(null);
  const playbackContextRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const questionRef = useRef("");
  const answerRef = useRef("");
  const answerStartedRef = useRef<string | null>(null);
  const questionRecordedRef = useRef(false);
  const questionSavingRef = useRef(false);
  const answerSavingRef = useRef(false);
  const finishingRef = useRef(false);
  const playbackTimeRef = useRef(0);

  function cleanup() {
    processorRef.current?.disconnect();
    sourceRef.current?.disconnect();
    void inputContextRef.current?.close();
    void playbackContextRef.current?.close();
    geminiRef.current?.close();
    streamRef.current?.getTracks().forEach((track) => track.stop());
    processorRef.current = null;
    sourceRef.current = null;
    inputContextRef.current = null;
    playbackContextRef.current = null;
    geminiRef.current = null;
    streamRef.current = null;
  }

  function fail(message: string) {
    cleanup();
    setError(message);
    setStatus("error");
  }

  async function saveAnswer() {
    const answer = answerRef.current.trim();
    if (!answer || !questionRecordedRef.current || answerSavingRef.current) return;
    answerSavingRef.current = true;
    try {
      const result = await recordInterviewAnswer(interviewId, answer, answerStartedRef.current || new Date().toISOString());
      answerRef.current = "";
      setTranscript("");
      questionRecordedRef.current = false;
      answerStartedRef.current = null;
      if (result.questionCountReached) await finish(true);
    } catch (requestError) {
      fail(apiError(requestError, "Unable to save your answer."));
    } finally {
      answerSavingRef.current = false;
    }
  }

  async function saveQuestion() {
    const pendingQuestion = questionRef.current.trim();
    if (!pendingQuestion || questionRecordedRef.current || questionSavingRef.current) return;
    questionSavingRef.current = true;
    try {
      await recordInterviewQuestion(interviewId, pendingQuestion);
      questionRecordedRef.current = true;
      questionRef.current = "";
    } finally {
      questionSavingRef.current = false;
    }
  }

  async function handleMessage(event: { serverContent?: Record<string, unknown> }) {
    const content = event.serverContent;
    if (!content) return;
    const output = (content.outputTranscription as { text?: string } | undefined)?.text?.trim();
    if (output) {
      questionRef.current = `${questionRef.current} ${output}`.trim();
      setQuestion(questionRef.current);
      if ((content.outputTranscription as { finished?: boolean } | undefined)?.finished && !questionRecordedRef.current) {
        await saveQuestion();
      }
    }
    const input = (content.inputTranscription as { text?: string } | undefined)?.text?.trim();
    if (input) {
      answerStartedRef.current ||= new Date().toISOString();
      answerRef.current = `${answerRef.current} ${input}`.trim();
      setTranscript(answerRef.current);
    }
    const modelTurn = content.modelTurn as { parts?: { inlineData?: { data?: string } }[] } | undefined;
    modelTurn?.parts?.forEach((part) => {
      if (part.inlineData?.data) playAudio(part.inlineData.data);
    });
    if (content.turnComplete) {
      await saveQuestion();
      if (questionRecordedRef.current && answerRef.current.trim()) await saveAnswer();
    }
  }

  function playAudio(encoded: string) {
    const context = playbackContextRef.current || new AudioContext({ sampleRate: 24000 });
    playbackContextRef.current = context;
    const bytes = fromBase64(encoded);
    const samples = new Int16Array(bytes.buffer, bytes.byteOffset, Math.floor(bytes.byteLength / 2));
    const buffer = context.createBuffer(1, samples.length, 24000);
    const channel = buffer.getChannelData(0);
    samples.forEach((sample, index) => { channel[index] = sample / 32768; });
    const source = context.createBufferSource();
    source.buffer = buffer;
    source.connect(context.destination);
    const start = Math.max(context.currentTime, playbackTimeRef.current);
    source.start(start);
    playbackTimeRef.current = start + buffer.duration;
  }

  async function start() {
    setStatus("connecting");
    setError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const { token, model } = await getGeminiToken(interviewId);
      const ai = new GoogleGenAI({ apiKey: token });
      const live = await ai.live.connect({
        model,
        config: { responseModalities: [Modality.AUDIO], inputAudioTranscription: {}, outputAudioTranscription: {} },
        callbacks: {
          onmessage: (event) => { void handleMessage(event as { serverContent?: Record<string, unknown> }); },
          onerror: (event) => fail(event.message || "The live interview connection failed."),
          onclose: () => {
            if (geminiRef.current === live && !finishingRef.current) {
              fail("The live interview disconnected. Please restart the interview.");
            }
          },
        },
      });
      geminiRef.current = live;
      const context = new AudioContext({ sampleRate: 16000 });
      inputContextRef.current = context;
      const source = context.createMediaStreamSource(stream);
      const processor = context.createScriptProcessor(4096, 1, 1);
      sourceRef.current = source;
      processorRef.current = processor;
      processor.onaudioprocess = (event) => {
        if (geminiRef.current !== live) return;
        event.outputBuffer.getChannelData(0).fill(0);
        live.sendRealtimeInput({ audio: { data: toBase64(toPcm16(event.inputBuffer.getChannelData(0), context.sampleRate)), mimeType: "audio/pcm;rate=16000" } });
      };
      source.connect(processor);
      processor.connect(context.destination);
      setStatus("live");
      live.sendClientContent({ turns: [{ role: "user", parts: [{ text: "Begin the interview now." }] }], turnComplete: true });
    } catch (requestError) {
      fail(apiError(requestError, requestError instanceof Error ? requestError.message : "Unable to start the voice interview."));
    }
  }

  async function finish(answerAlreadySaved = false) {
    if (finishingRef.current) return;
    finishingRef.current = true;
    setStatus("complete");
    setError("");
    try {
      if (!answerAlreadySaved) {
        await saveQuestion();
        await saveAnswer();
      }
      const result = await endInterview(interviewId);
      cleanup();
      const completedInterview = result.interview || (await getInterview(interviewId)).interview;
      if (!completedInterview) throw new Error("The completed interview feedback was not returned.");
      setFeedback(completedInterview);
    } catch (requestError) {
      finishingRef.current = false;
      fail(apiError(requestError, "Unable to complete the interview."));
    }
  }

  useEffect(() => () => cleanup(), []);

  if (feedback) {
    return <InterviewFeedback interview={feedback as unknown as InterviewFeedbackData} onReset={onReset} />;
  }

  return <section className="panel interview-room"><div className="interview-room-heading"><div><p className="eyebrow">LIVE SESSION</p><h2>{status === "live" ? "Interview in progress" : status === "complete" ? "Preparing your feedback" : "Ready to begin"}</h2></div><span className={`chip ${status === "live" ? "green" : "blue"}`}>{status === "complete" ? "finalizing" : status}</span></div><p className="muted">{status === "complete" ? "Your final answer was saved. We are generating your question-wise feedback…" : "Allow microphone access, then answer naturally. The interviewer will speak first."}</p><div className="interviewer-card"><div className="feature-icon violet"><Bot size={22} /></div><div><strong>Interviewer</strong><p>{question || "Your first question will appear after the session connects."}</p></div></div>{transcript && <div className="interview-transcript"><span>Live transcript</span><p>{transcript}</p></div>}{error && <div className="alert error">{error}</div>}<div className="interview-room-actions">{status === "idle" && <button className="button primary" onClick={() => void start()}><Mic2 size={16} /> Begin interview</button>}{status === "connecting" && <button className="button primary" disabled><Mic2 size={16} /> Connecting…</button>}{status === "live" && <button className="button danger" onClick={() => void finish()}><Square size={15} /> End interview</button>}{status === "complete" && <p className="muted">Please wait…</p>}{status === "error" && <button className="button primary" onClick={() => void start()}><Mic2 size={16} /> Retry interview</button>}</div></section>;
}
