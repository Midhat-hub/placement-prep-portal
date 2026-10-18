import { api } from "./client";

export type InterviewSetup = {
  mode: "resume_based" | "role_based";
  role: string;
  jobDescription: string;
  questionCount: number;
  focus: string;
  resume?: File;
};

export async function startInterview(setup: InterviewSetup) {
  const form = new FormData();
  form.append("mode", setup.mode);
  form.append("role", setup.role);
  form.append("jobDescription", setup.jobDescription);
  form.append("questionCount", String(setup.questionCount));
  form.append("focus", setup.focus);
  if (setup.resume) form.append("resume", setup.resume);
  const response = await api.post("/api/interview/start", form);
  return response.data;
}

export async function getGeminiToken(interviewId: string) {
  const response = await api.post(`/api/interview/${interviewId}/gemini-token`);
  return response.data;
}

export async function recordInterviewQuestion(interviewId: string, question: string) {
  const response = await api.post(`/api/interview/${interviewId}/question`, { question });
  return response.data;
}

export async function recordInterviewAnswer(interviewId: string, answer: string, answerStartedAt: string) {
  const response = await api.post(`/api/interview/${interviewId}/answer`, {
    answer,
    answerStartedAt,
    answerEndedAt: new Date().toISOString(),
  });
  return response.data;
}

export async function endInterview(interviewId: string) {
  const response = await api.post(`/api/interview/${interviewId}/end`);
  return response.data;
}
