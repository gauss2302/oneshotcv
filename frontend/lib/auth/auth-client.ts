import { createAuthClient } from "better-auth/react";

import { getPublicApiBase } from "@/lib/api/client";

export const authClient = createAuthClient({
  baseURL: getPublicApiBase(),
});
