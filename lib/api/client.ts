interface ApiFetchOptions extends Omit<RequestInit, "body"> {
  body?: BodyInit | null;
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
  const response = await fetch(path, {
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
