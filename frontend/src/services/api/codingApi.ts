import { api } from "./client";

export type CodingSubmission = {
  problem_id: string;
  language: string;
  source_code: string;
};

export async function submitCode(payload: CodingSubmission) {
  const response = await api.post("/api/coding/submit", payload);
  return response.data;
}
