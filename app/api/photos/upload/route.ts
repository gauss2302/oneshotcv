import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { db } from "@/db";
import { photos } from "@/db/schema";
import { uploadToMinio, validateImageDimensions } from "@/lib/minio";
import {
  validateFileType,
  sanitizeFileName,
  validateFileSize,
  getMimeTypeFromMagic,
} from "@/lib/file-validation";
import { checkRateLimit, getClientIdentifier, rateLimitConfigs } from "@/lib/rate-limit";
import { v4 as uuidv4 } from "uuid";
import { eq, count } from "drizzle-orm";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_PHOTOS_PER_USER = 5;

export async function POST(req: NextRequest) {
  try {
    // Rate limiting
    const clientId = getClientIdentifier(req);
    const rateLimit = checkRateLimit(clientId, rateLimitConfigs.upload);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: "Rate limit exceeded. Please try again later.",
          retryAfter: Math.ceil((rateLimit.resetTime - Date.now()) / 1000),
        },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": rateLimitConfigs.upload.maxRequests.toString(),
            "X-RateLimit-Remaining": rateLimit.remaining.toString(),
            "X-RateLimit-Reset": new Date(rateLimit.resetTime).toISOString(),
            "Retry-After": Math.ceil((rateLimit.resetTime - Date.now()) / 1000).toString(),
          },
        }
      );
    }

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Check if user has reached photo limit
    const [photoCount] = await db
      .select({ count: count() })
      .from(photos)
      .where(eq(photos.userId, userId));

    if (photoCount.count >= MAX_PHOTOS_PER_USER) {
      return NextResponse.json(
        {
          error: `Maximum ${MAX_PHOTOS_PER_USER} photos allowed. Please delete an existing photo first.`,
        },
        { status: 400 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file size first (before reading into buffer)
    if (!validateFileSize(file.size, MAX_FILE_SIZE)) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 10MB." },
        { status: 400 }
      );
    }

    // Validate declared MIME type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only JPEG, PNG, and WebP are allowed." },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // Magic number validation - verify actual file type matches declared type
    const actualMimeType = getMimeTypeFromMagic(buffer);
    if (!actualMimeType || !validateFileType(buffer, file.type)) {
      return NextResponse.json(
        { error: "File type mismatch. The file content does not match the declared type." },
        { status: 400 }
      );
    }

    // Use actual detected MIME type instead of declared type
    const verifiedMimeType = actualMimeType;

    // Validate dimensions
    const { width, height, isValid } = await validateImageDimensions(buffer);
    if (!isValid) {
      return NextResponse.json(
        { error: "Image too small. Minimum dimensions are 200x200 pixels." },
        { status: 400 }
      );
    }

    // Sanitize filename
    const sanitizedFileName = sanitizeFileName(file.name);

    const photoId = uuidv4();
    const extension = verifiedMimeType.split("/")[1];
    const originalPath = `originals/${userId}/${photoId}.${extension}`;

    // Upload original to MinIO
    await uploadToMinio(buffer, originalPath, verifiedMimeType);

    // Save to database
    const [newPhoto] = await db
      .insert(photos)
      .values({
        id: photoId,
        userId,
        originalPath,
        fileName: sanitizedFileName,
        fileSize: file.size,
        mimeType: verifiedMimeType,
        width,
        height,
        isActive: true,
      })
      .returning();

    return NextResponse.json({
      success: true,
      photo: {
        id: newPhoto.id,
        fileName: newPhoto.fileName,
        fileSize: newPhoto.fileSize,
        width: newPhoto.width,
        height: newPhoto.height,
      },
    });
  } catch (error) {
    // Log error details in development, sanitize in production
    if (process.env.NODE_ENV === "development") {
      console.error("Photo upload error:", error);
    }
    return NextResponse.json(
      { error: "Upload failed. Please try again." },
      { status: 500 }
    );
  }
}
