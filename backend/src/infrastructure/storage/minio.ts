import { Client } from "minio";
import sharp from "sharp";

import { getBackendEnv } from "@/config/env";

let minioClient: Client | null = null;

export interface BackendCropData {
  x: number;
  y: number;
  width: number;
  height: number;
  zoom?: number;
}

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

export async function ensureBackendBucket(): Promise<void> {
  const client = getBackendMinioClient();
  const bucketName = getBackendBucketName();

  if (!client || !bucketName) {
    throw new Error("MinIO is not configured");
  }

  const bucketExists = await client.bucketExists(bucketName);
  if (!bucketExists) {
    await client.makeBucket(bucketName, "us-east-1");
  }

  const policy = {
    Version: "2012-10-17",
    Statement: [
      {
        Effect: "Allow",
        Principal: { AWS: ["*"] },
        Action: ["s3:GetObject"],
        Resource: [`arn:aws:s3:::${bucketName}/processed/*`],
      },
      {
        Effect: "Allow",
        Principal: { AWS: ["*"] },
        Action: ["s3:GetObject"],
        Resource: [`arn:aws:s3:::${bucketName}/originals/*`],
      },
    ],
  };

  await client.setBucketPolicy(bucketName, JSON.stringify(policy));
}

export async function uploadToBackendMinio(
  buffer: Buffer,
  path: string,
  contentType: string
): Promise<string> {
  const client = getBackendMinioClient();
  const bucketName = getBackendBucketName();

  if (!client || !bucketName) {
    throw new Error("MinIO is not configured");
  }

  await ensureBackendBucket();
  await client.putObject(bucketName, path, buffer, buffer.length, {
    "Content-Type": contentType,
  });

  return path;
}

export async function deleteFromBackendMinio(path: string): Promise<void> {
  const client = getBackendMinioClient();
  const bucketName = getBackendBucketName();

  if (!client || !bucketName) {
    throw new Error("MinIO is not configured");
  }

  await client.removeObject(bucketName, path);
}

export async function getFromBackendMinio(path: string): Promise<Buffer> {
  const client = getBackendMinioClient();
  const bucketName = getBackendBucketName();

  if (!client || !bucketName) {
    throw new Error("MinIO is not configured");
  }

  const stream = await client.getObject(bucketName, path);
  const chunks: Buffer[] = [];

  return new Promise((resolve, reject) => {
    stream.on("data", (chunk) => chunks.push(chunk));
    stream.on("end", () => resolve(Buffer.concat(chunks)));
    stream.on("error", reject);
  });
}

export async function validateBackendImageDimensions(
  buffer: Buffer
): Promise<{ width: number; height: number; isValid: boolean }> {
  const metadata = await sharp(buffer).metadata();
  const width = metadata.width || 0;
  const height = metadata.height || 0;

  return {
    width,
    height,
    isValid: width >= 200 && height >= 200,
  };
}

export async function processBackendImage(
  buffer: Buffer,
  basePath: string,
  options: {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
    crop?: BackendCropData;
  }
): Promise<{ path: string; width: number; height: number }> {
  let processor = sharp(buffer, {
    failOnError: false,
    limitInputPixels: 268402689,
  });

  if (options.crop) {
    processor = processor.extract({
      left: Math.round(options.crop.x),
      top: Math.round(options.crop.y),
      width: Math.round(options.crop.width),
      height: Math.round(options.crop.height),
    });
  }

  if (options.maxWidth || options.maxHeight) {
    processor = processor.resize(options.maxWidth, options.maxHeight, {
      withoutEnlargement: true,
      fit: "inside",
      kernel: sharp.kernel.lanczos3,
    });
  }

  const webpBuffer = await processor
    .webp({
      quality: options.quality || 85,
      effort: 4,
      smartSubsample: true,
    })
    .toBuffer();

  const metadata = await sharp(webpBuffer).metadata();
  const path = `${basePath}_${metadata.width}x${metadata.height}.webp`;

  await uploadToBackendMinio(webpBuffer, path, "image/webp");

  return {
    path,
    width: metadata.width || 0,
    height: metadata.height || 0,
  };
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
