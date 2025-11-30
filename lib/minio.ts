import { Client } from 'minio';
import sharp from 'sharp';

const minioClient = new Client({
  endPoint: process.env.MINIO_ENDPOINT!,
  port: parseInt(process.env.MINIO_PORT!),
  useSSL: process.env.MINIO_USE_SSL === 'true',
  accessKey: process.env.MINIO_ACCESS_KEY!,
  secretKey: process.env.MINIO_SECRET_KEY!,
});

const BUCKET_NAME = process.env.MINIO_BUCKET_NAME!;

export interface CropData {
  x: number;
  y: number;
  width: number;
  height: number;
  zoom?: number;
}

export async function ensureBucket(): Promise<void> {
  try {
    const exists = await minioClient.bucketExists(BUCKET_NAME);
    if (!exists) {
      await minioClient.makeBucket(BUCKET_NAME, 'us-east-1');
      console.log(`MinIO bucket "${BUCKET_NAME}" created`);
    }

    // Always ensure the policy is set correctly (for both new and existing buckets)
    const policy = {
      Version: '2012-10-17',
      Statement: [
        {
          Effect: 'Allow',
          Principal: { AWS: ['*'] },
          Action: ['s3:GetObject'],
          Resource: [`arn:aws:s3:::${BUCKET_NAME}/processed/*`]
        },
        {
          Effect: 'Allow',
          Principal: { AWS: ['*'] },
          Action: ['s3:GetObject'],
          Resource: [`arn:aws:s3:::${BUCKET_NAME}/originals/*`]
        }
      ]
    };

    await minioClient.setBucketPolicy(BUCKET_NAME, JSON.stringify(policy));
    console.log(`MinIO bucket "${BUCKET_NAME}" policy updated - public access enabled for originals and processed folders`);
  } catch (error) {
    console.error('Error ensuring MinIO bucket:', error);
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

    await minioClient.putObject(BUCKET_NAME, path, buffer, buffer.length, {
      'Content-Type': contentType,
    });

    return path;
  } catch (error) {
    console.error('Error uploading to MinIO:', error);
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
    let processor = sharp(buffer);

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
      });
    }

    // Convert to WebP format
    const webpBuffer = await processor
      .webp({ quality: options.quality || 85 })
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
    console.error('Error processing image:', error);
    throw error;
  }
}

export async function deleteFromMinio(path: string): Promise<void> {
  try {
    await minioClient.removeObject(BUCKET_NAME, path);
  } catch (error) {
    console.error('Error deleting from MinIO:', error);
    throw error;
  }
}

export async function getFromMinio(path: string): Promise<Buffer> {
  try {
    const chunks: Buffer[] = [];
    const stream = await minioClient.getObject(BUCKET_NAME, path);

    return new Promise((resolve, reject) => {
      stream.on('data', (chunk) => chunks.push(chunk));
      stream.on('end', () => resolve(Buffer.concat(chunks)));
      stream.on('error', reject);
    });
  } catch (error) {
    console.error('Error getting from MinIO:', error);
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
    console.error('Error validating image dimensions:', error);
    throw error;
  }
}

export function getPublicUrl(path: string): string {
  return `${process.env.NEXT_PUBLIC_MINIO_PUBLIC_URL}/${BUCKET_NAME}/${path}`;
}
