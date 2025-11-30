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

    if (!photoId || !resumeId || !cropData || !templateId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate template supports photos
    if (!templateSupportsPhoto(templateId)) {
      return NextResponse.json(
        { error: "This template does not support profile photos" },
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

    // Check if photo is already attached to another resume
    const [photoAttachment] = await db
      .select()
      .from(resumePhotos)
      .where(eq(resumePhotos.photoId, photoId))
      .limit(1);

    if (photoAttachment && photoAttachment.resumeId !== resumeId) {
      return NextResponse.json(
        {
          error:
            "This photo is already attached to another resume. Please select a different photo or remove it from the other resume first.",
        },
        { status: 400 }
      );
    }

    // Check if resume already has a photo attached
    const [existingResumePhoto] = await db
      .select()
      .from(resumePhotos)
      .where(eq(resumePhotos.resumeId, resumeId))
      .limit(1);

    // If there's an existing photo, we'll replace it
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
    return NextResponse.json(
      { error: "Failed to attach photo" },
      { status: 500 }
    );
  }
}
