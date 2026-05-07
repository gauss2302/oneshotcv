import {
  deleteResumeResponseSchema,
  resumeGetResponseSchema,
  resumeListResponseSchema,
  saveResumeResponseSchema,
  type SaveResumeRequest,
} from "@contracts/resume";

import { apiFetch } from "./client";

export async function fetchResumeList() {
  const response = await apiFetch<unknown>("/api/resume/list", {
    cache: "no-store",
  });

  return resumeListResponseSchema.parse(response);
}

export async function fetchResume(resumeId?: string) {
  const search = resumeId ? `?id=${resumeId}` : "";
  const response = await apiFetch<unknown>(`/api/resume${search}`, {
    cache: "no-store",
  });

  return resumeGetResponseSchema.parse(response);
}

export async function saveResume(payload: SaveResumeRequest) {
  const response = await apiFetch<unknown>("/api/resume", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return saveResumeResponseSchema.parse(response);
}

export async function deleteResume(resumeId: string) {
  const response = await apiFetch<unknown>("/api/resume", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id: resumeId }),
  });

  return deleteResumeResponseSchema.parse(response);
}
