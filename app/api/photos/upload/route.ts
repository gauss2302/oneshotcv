import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { db } from "@/db";
import { photos } from "@/db/schema";
import { uploadToMinio, validateImageDimensions } from "@/lib/minio";
import { v4 as uuidv4 } from "uuid";
import { eq, count } from "drizzle-orm";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_PHOTOS_PER_USER = 5;

export async function POST(req: NextRequest) {
  try {
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

    // Validation
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only JPEG, PNG, and WebP are allowed." },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 10MB." },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // Validate dimensions
    const { width, height, isValid } = await validateImageDimensions(buffer);
    if (!isValid) {
      return NextResponse.json(
        { error: "Image too small. Minimum dimensions are 200x200 pixels." },
        { status: 400 }
      );
    }

    const photoId = uuidv4();
    const extension = file.type.split("/")[1];
    const originalPath = `originals/${userId}/${photoId}.${extension}`;

    // Upload original to MinIO
    await uploadToMinio(buffer, originalPath, file.type);

    // Save to database
    const [newPhoto] = await db
      .insert(photos)
      .values({
        id: photoId,
        userId,
        originalPath,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
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
    console.error("Photo upload error:", error);
    return NextResponse.json(
      { error: "Upload failed. Please try again." },
      { status: 500 }
    );
  }
}
