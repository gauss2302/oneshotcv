import { Client } from "minio";

import { getBackendEnv } from "@/config/env";

let minioClient: Client | null = null;

export function getBackendMinioClient(): Client | null {
  if (minioClient) {
    return minioClient;
  }

  const env = getBackendEnv();
  if (
    !env.MINIO_ENDPOINT
    || !env.MINIO_PORT
    || !env.MINIO_ACCESS_KEY
    || !env.MINIO_SECRET_KEY
  ) {
    return null;
  }

  minioClient = new Client({
    endPoint: env.MINIO_ENDPOINT,
    port: env.MINIO_PORT,
    useSSL: env.MINIO_USE_SSL ?? false,
    accessKey: env.MINIO_ACCESS_KEY,
    secretKey: env.MINIO_SECRET_KEY,
  });

  return minioClient;
}

export function getBackendBucketName(): string | null {
  return getBackendEnv().MINIO_BUCKET_NAME ?? null;
}

export function getBackendPublicFileUrl(path: string): string | null {
  const env = getBackendEnv();
  if (!env.NEXT_PUBLIC_MINIO_PUBLIC_URL || !env.MINIO_BUCKET_NAME) {
    return null;
  }

  return `${env.NEXT_PUBLIC_MINIO_PUBLIC_URL}/${env.MINIO_BUCKET_NAME}/${path}`;
}

export async function checkBackendStorageHealth(): Promise<boolean | null> {
  const client = getBackendMinioClient();
  const bucketName = getBackendBucketName();

  if (!client || !bucketName) {
    return null;
  }

  try {
    await client.bucketExists(bucketName);
    return true;
  } catch {
    return false;
  }
}
