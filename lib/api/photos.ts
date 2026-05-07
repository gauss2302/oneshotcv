import {
  attachPhotoResponseSchema,
  deletePhotoConflictResponseSchema,
  messageResponseSchema,
  photoLibraryResponseSchema,
  photoUploadResponseSchema,
  type AttachPhotoRequest,
  type DetachPhotoRequest,
  type LibraryPhoto,
} from "@contracts/photo";

import { apiFetch } from "./client";

export async function uploadPhoto(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await apiFetch<unknown>("/api/photos/upload", {
    method: "POST",
    body: formData,
  });

  return photoUploadResponseSchema.parse(response);
}

export async function fetchPhotoLibrary(): Promise<LibraryPhoto[]> {
  const response = await apiFetch<unknown>("/api/photos/library");
  return photoLibraryResponseSchema.parse(response).photos;
}

export async function attachPhoto(payload: AttachPhotoRequest) {
  const response = await apiFetch<unknown>("/api/photos/attach", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return attachPhotoResponseSchema.parse(response);
}

export async function detachPhoto(payload: DetachPhotoRequest) {
  const response = await apiFetch<unknown>("/api/photos/detach", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return messageResponseSchema.parse(response);
}

export async function deletePhoto(photoId: string, force = false) {
  const url = force
    ? `/api/photos/${photoId}?force=true`
    : `/api/photos/${photoId}`;

  try {
    const response = await apiFetch<unknown>(url, {
      method: "DELETE",
    });

    return {
      success: true as const,
      data: messageResponseSchema.parse(response),
    };
  } catch (error) {
    if (!(error instanceof Error)) {
      throw error;
    }

    const response = await fetch(url, {
      method: "DELETE",
      credentials: "include",
    });

    if (response.status !== 409) {
      throw error;
    }

    const payload = await response.json();
    return {
      success: false as const,
      conflict: deletePhotoConflictResponseSchema.parse(payload),
    };
  }
}
