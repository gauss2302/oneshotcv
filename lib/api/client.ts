interface ApiFetchOptions extends Omit<RequestInit, "body"> {
  body?: BodyInit | null;
}

/**
 * Public HTTP API base URL (Fastify). The browser calls this host directly; Next.js does not proxy `/api`.
 */
export function getPublicApiBase(): string {
  return process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:4000";
}

export function resolvePublicApiUrl(path: string): string {
  const base = getPublicApiBase().replace(/\/$/, "");
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalized}`;
}

function extractErrorMessage(payload: unknown): string | null {
  if (
    payload
    && typeof payload === "object"
    && "error" in payload
    && typeof (payload as { error?: unknown }).error === "string"
  ) {
    return (payload as { error: string }).error;
  }

  return null;
}

export async function apiFetch<T>(
  path: string,
  options: ApiFetchOptions = {}
): Promise<T> {
  const url = resolvePublicApiUrl(path);
  const response = await fetch(url, {
    credentials: "include",
    ...options,
  });

  if (!response.ok) {
    let errorMessage = `Request failed with status ${response.status}`;

    try {
      const payload = await response.json();
      errorMessage = extractErrorMessage(payload) ?? errorMessage;
    } catch {
      // Ignore JSON parsing failures and fall back to the status-based message.
    }

    throw new Error(errorMessage);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}
