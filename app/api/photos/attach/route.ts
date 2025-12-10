import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { db } from "@/db";
import { photos, resumePhotos, resumes } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import {
  getFromMinio,
  processImage,
  getPublicUrl,
  deleteFromMinio,
} from "@/lib/minio";
import {
  getProcessingDimensions,
  templateSupportsPhoto,
} from "@/lib/template-config";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { photoId, resumeId, cropData, templateId } = body;

    // Detailed validation with specific error messages
    if (!photoId) {
      return NextResponse.json(
        { error: "Missing required field: photoId" },
        { status: 400 }
      );
    }
    if (!resumeId) {
      return NextResponse.json(
        { error: "Missing required field: resumeId" },
        { status: 400 }
      );
    }
    if (!cropData) {
      return NextResponse.json(
        { error: "Missing required field: cropData" },
        { status: 400 }
      );
    }
    if (!templateId) {
      return NextResponse.json(
        { error: "Missing required field: templateId" },
        { status: 400 }
      );
    }

    // Validate cropData structure
    if (typeof cropData !== "object") {
      return NextResponse.json(
        { error: "Invalid crop data format: must be an object" },
        { status: 400 }
      );
    }
    if (
      typeof cropData.x !== "number" ||
      typeof cropData.y !== "number" ||
      typeof cropData.width !== "number" ||
      typeof cropData.height !== "number"
    ) {
      return NextResponse.json(
        {
          error:
            "Invalid crop data format: x, y, width, and height must be numbers",
          received: cropData,
        },
        { status: 400 }
      );
    }
    if (cropData.width <= 0 || cropData.height <= 0) {
      return NextResponse.json(
        {
          error:
            "Invalid crop data format: width and height must be greater than 0",
        },
        { status: 400 }
      );
    }

    // Validate template supports photos
    if (!templateSupportsPhoto(templateId)) {
      return NextResponse.json(
        {
          error: "This template does not support profile photos",
          templateId,
          supportedTemplates: [
            "sidebar",
            "modern",
            "creative",
            "designer",
            "executive",
          ],
        },
        { status: 400 }
      );
    }

    const userId = session.user.id;

    // Verify photo ownership
    const [photo] = await db
      .select()
      .from(photos)
      .where(and(eq(photos.id, photoId), eq(photos.userId, userId)))
      .limit(1);

    if (!photo) {
      return NextResponse.json(
        { error: "Photo not found or access denied" },
        { status: 404 }
      );
    }

    // Verify resume ownership
    const [resumeRecord] = await db
      .select()
      .from(resumes)
      .where(and(eq(resumes.id, resumeId), eq(resumes.userId, userId)))
      .limit(1);

    if (!resumeRecord) {
      return NextResponse.json(
        { error: "Resume not found or access denied" },
        { status: 404 }
      );
    }

    // Check if resume already has a photo attached (we'll replace it)
    // Note: Photos can be attached to multiple resumes, so we don't check if
    // this photo is already used elsewhere - that's allowed
    const [existingResumePhoto] = await db
      .select()
      .from(resumePhotos)
      .where(eq(resumePhotos.resumeId, resumeId))
      .limit(1);

    // If there's an existing photo (same or different), delete it to replace with new crop
    if (existingResumePhoto) {
      // Delete old processed image from MinIO
      try {
        await deleteFromMinio(existingResumePhoto.processedPath);
      } catch (error) {
        console.warn("Failed to delete old processed image:", error);
        // Continue even if deletion fails
      }

      // Delete the old resume_photos record
      await db.delete(resumePhotos).where(eq(resumePhotos.resumeId, resumeId));
    }

    // Load original image from MinIO
    const originalBuffer = await getFromMinio(photo.originalPath);

    // Get processing dimensions for this template
    const { maxWidth, maxHeight } = getProcessingDimensions(templateId);

    // Process image with crop and resize
    const processedResult = await processImage(
      originalBuffer,
      `processed/${userId}/${photoId}_${resumeId}`,
      {
        maxWidth,
        maxHeight,
        quality: 85,
        crop: cropData,
      }
    );

    // Create resume_photos record
    const [newResumePhoto] = await db
      .insert(resumePhotos)
      .values({
        id: uuidv4(),
        resumeId,
        photoId,
        processedPath: processedResult.path,
        cropData: JSON.stringify(cropData),
      })
      .returning();

    return NextResponse.json({
      success: true,
      resumePhoto: {
        id: newResumePhoto.id,
        photoId: newResumePhoto.photoId,
        url: getPublicUrl(processedResult.path),
        cropData: JSON.parse(newResumePhoto.cropData || "{}"),
      },
    });
  } catch (error) {
    console.error("Error attaching photo:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to attach photo", details: errorMessage },
      { status: 500 }
    );
  }
}
