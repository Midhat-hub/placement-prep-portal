import { api } from "./client";

export async function analyzeResume(file: File, jobDescription: string) {
  const form = new FormData();
  form.append("file", file);
  if (jobDescription.trim()) form.append("job_description", jobDescription.trim());
  const response = await api.post("/api/full-analysis", form);
  return response.data;
}
