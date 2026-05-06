const METHODS_WITHOUT_BODY = new Set(["GET", "HEAD"]);

function getBackendOrigin(): string {
  return process.env.INDEPENDENT_BACKEND_URL ?? "http://localhost:4000";
}

function buildBackendUrl(request: Request, pathname?: string): string {
  const incomingUrl = new URL(request.url);
  const backendUrl = new URL(pathname ?? incomingUrl.pathname, getBackendOrigin());
  backendUrl.search = incomingUrl.search;
  return backendUrl.toString();
}

function copyResponseHeaders(response: Response): Headers {
  const headers = new Headers(response.headers);
  const nodeHeaders = response.headers as Headers & {
    getSetCookie?: () => string[];
  };

  if (typeof nodeHeaders.getSetCookie === "function") {
    headers.delete("set-cookie");
    for (const cookie of nodeHeaders.getSetCookie()) {
      headers.append("set-cookie", cookie);
    }
  }

  return headers;
}

export async function proxyToBackend(
  request: Request,
  pathname?: string
): Promise<Response> {
  const incomingUrl = new URL(request.url);
  const targetUrl = buildBackendUrl(request, pathname);
  const headers = new Headers(request.headers);
  headers.delete("host");
  headers.set("x-forwarded-host", incomingUrl.host);
  headers.set("x-forwarded-proto", incomingUrl.protocol.replace(":", ""));

  let body: BodyInit | undefined;
  if (!METHODS_WITHOUT_BODY.has(request.method)) {
    const buffer = Buffer.from(await request.arrayBuffer());
    body = buffer.length > 0 ? buffer : undefined;
  }

  const response = await fetch(targetUrl, {
    method: request.method,
    headers,
    body,
    redirect: "manual",
    cache: "no-store",
  });

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: copyResponseHeaders(response),
  });
}
