import { Client } from 'minio';
import sharp from 'sharp';

// Lazy initialization to prevent build-time errors when env vars are not available
let minioClient: Client | null = null;
let BUCKET_NAME: string | null = null;

export function getMinioClient(): Client {
  if (!minioClient) {
    const endPoint = process.env.MINIO_ENDPOINT;
    const port = process.env.MINIO_PORT;
    const useSSL = process.env.MINIO_USE_SSL;
    const accessKey = process.env.MINIO_ACCESS_KEY;
    const secretKey = process.env.MINIO_SECRET_KEY;

    if (!endPoint || !port || !accessKey || !secretKey) {
      throw new Error(
        'MinIO configuration is missing. Please set MINIO_ENDPOINT, MINIO_PORT, MINIO_ACCESS_KEY, and MINIO_SECRET_KEY environment variables.'
      );
    }

    minioClient = new Client({
      endPoint,
      port: parseInt(port),
      useSSL: useSSL === 'true',
      accessKey,
      secretKey,
    });
  }

  return minioClient;
}

export function getBucketName(): string {
  if (!BUCKET_NAME) {
    BUCKET_NAME = process.env.MINIO_BUCKET_NAME ?? null;
    if (!BUCKET_NAME) {
      throw new Error(
        'MINIO_BUCKET_NAME environment variable is not set.'
      );
    }
  }
  return BUCKET_NAME;
}

export interface CropData {
  x: number;
  y: number;
  width: number;
  height: number;
  zoom?: number;
}

export async function ensureBucket(): Promise<void> {
  try {
    const client = getMinioClient();
    const bucketName = getBucketName();
    
    const exists = await client.bucketExists(bucketName);
    if (!exists) {
      await client.makeBucket(bucketName, 'us-east-1');
      if (process.env.NODE_ENV === "development") {
        console.log(`MinIO bucket "${bucketName}" created`);
      }
    }

    // Always ensure the policy is set correctly (for both new and existing buckets)
    const policy = {
      Version: '2012-10-17',
      Statement: [
        {
          Effect: 'Allow',
          Principal: { AWS: ['*'] },
          Action: ['s3:GetObject'],
          Resource: [`arn:aws:s3:::${bucketName}/processed/*`]
        },
        {
          Effect: 'Allow',
          Principal: { AWS: ['*'] },
          Action: ['s3:GetObject'],
          Resource: [`arn:aws:s3:::${bucketName}/originals/*`]
        }
      ]
    };

    await client.setBucketPolicy(bucketName, JSON.stringify(policy));
    if (process.env.NODE_ENV === "development") {
      console.log(`MinIO bucket "${bucketName}" policy updated - public access enabled for originals and processed folders`);
    }
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error('Error ensuring MinIO bucket:', error);
    }
    throw error;
  }
}

export async function uploadToMinio(
  buffer: Buffer,
  path: string,
  contentType: string
): Promise<string> {
  try {
    await ensureBucket();

    const client = getMinioClient();
    const bucketName = getBucketName();

    await client.putObject(bucketName, path, buffer, buffer.length, {
      'Content-Type': contentType,
    });

    return path;
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error('Error uploading to MinIO:', error);
    }
    throw error;
  }
}

export async function processImage(
  buffer: Buffer,
  basePath: string,
  options: {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
    crop?: CropData
  }
): Promise<{ path: string; width: number; height: number }> {
  try {
    let processor = sharp(buffer, {
      // Optimize for performance
      failOnError: false,
      limitInputPixels: 268402689, // ~16383^2 pixels (safety limit)
    });

    // Apply crop if provided
    if (options.crop) {
      processor = processor.extract({
        left: Math.round(options.crop.x),
        top: Math.round(options.crop.y),
        width: Math.round(options.crop.width),
        height: Math.round(options.crop.height),
      });
    }

    // Resize if max dimensions provided
    if (options.maxWidth || options.maxHeight) {
      processor = processor.resize(options.maxWidth, options.maxHeight, {
        withoutEnlargement: true,
        fit: 'inside',
        // Optimize resize algorithm for performance
        kernel: sharp.kernel.lanczos3,
      });
    }

    // Convert to WebP format with optimized settings
    const webpBuffer = await processor
      .webp({ 
        quality: options.quality || 85,
        effort: 4, // Balance between compression speed and file size (0-6)
        smartSubsample: true, // Better quality for smaller files
      })
      .toBuffer();

    // Get metadata for dimensions
    const metadata = await sharp(webpBuffer).metadata();
    const path = `${basePath}_${metadata.width}x${metadata.height}.webp`;

    // Upload to MinIO
    await uploadToMinio(webpBuffer, path, 'image/webp');

    return {
      path,
      width: metadata.width!,
      height: metadata.height!,
    };
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error('Error processing image:', error);
    }
    throw error;
  }
}

export async function deleteFromMinio(path: string): Promise<void> {
  try {
    const client = getMinioClient();
    const bucketName = getBucketName();
    await client.removeObject(bucketName, path);
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error('Error deleting from MinIO:', error);
    }
    throw error;
  }
}

export async function getFromMinio(path: string): Promise<Buffer> {
  try {
    const client = getMinioClient();
    const bucketName = getBucketName();
    const chunks: Buffer[] = [];
    const stream = await client.getObject(bucketName, path);

    return new Promise((resolve, reject) => {
      stream.on('data', (chunk) => chunks.push(chunk));
      stream.on('end', () => resolve(Buffer.concat(chunks)));
      stream.on('error', reject);
    });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error('Error getting from MinIO:', error);
    }
    throw error;
  }
}

export async function validateImageDimensions(
  buffer: Buffer
): Promise<{ width: number; height: number; isValid: boolean }> {
  try {
    const metadata = await sharp(buffer).metadata();
    const width = metadata.width || 0;
    const height = metadata.height || 0;

    // Minimum 200x200px required
    const isValid = width >= 200 && height >= 200;

    return { width, height, isValid };
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error('Error validating image dimensions:', error);
    }
    throw error;
  }
}

export function getPublicUrl(path: string): string {
  const publicUrl = process.env.NEXT_PUBLIC_MINIO_PUBLIC_URL;
  const bucketName = process.env.MINIO_BUCKET_NAME;
  
  if (!publicUrl || !bucketName) {
    throw new Error(
      'MinIO public URL or bucket name is not configured. Please set NEXT_PUBLIC_MINIO_PUBLIC_URL and MINIO_BUCKET_NAME environment variables.'
    );
  }
  
  return `${publicUrl}/${bucketName}/${path}`;
}
