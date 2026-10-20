import { api } from "./client";

export type ChatSource = {
  source: string;
  category: string;
  subject: string;
  score: number;
};

export type ChatResponse = {
  response: string;
  sources?: ChatSource[];
  source_count?: number;
};

export async function sendChatMessage(message: string): Promise<ChatResponse> {
  if (!message.trim()) throw new Error("Message cannot be empty.");
  const response = await api.post<ChatResponse>("/api/chatbot/chat", { message: message.trim() });
  return response.data;
}
