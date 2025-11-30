import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { db } from "@/db";
import { resumePhotos, photos, resumes } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import {
  getFromMinio,
  processImage,
  getPublicUrl,
  deleteFromMinio,
} from "@/lib/minio";
import { getProcessingDimensions } from "@/lib/template-config";

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { resumePhotoId, cropData, templateId } = body;

    if (!resumePhotoId || !cropData || !templateId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const userId = session.user.id;

    // Get resume photo with related data
    const [resumePhoto] = await db
      .select({
        resumePhoto: resumePhotos,
        photo: photos,
        resume: resumes,
      })
      .from(resumePhotos)
      .innerJoin(photos, eq(resumePhotos.photoId, photos.id))
      .innerJoin(resumes, eq(resumePhotos.resumeId, resumes.id))
      .where(
        and(eq(resumePhotos.id, resumePhotoId), eq(resumes.userId, userId))
      )
      .limit(1);

    if (!resumePhoto) {
      return NextResponse.json(
        { error: "Resume photo not found or access denied" },
        { status: 404 }
      );
    }

    // Delete old processed image
    try {
      await deleteFromMinio(resumePhoto.resumePhoto.processedPath);
    } catch (error) {
      console.warn("Failed to delete old processed image:", error);
      // Continue even if deletion fails
    }

    // Load original image from MinIO
    const originalBuffer = await getFromMinio(resumePhoto.photo.originalPath);

    // Get processing dimensions for this template
    const { maxWidth, maxHeight } = getProcessingDimensions(templateId);

    // Process image with new crop
    const processedResult = await processImage(
      originalBuffer,
      `processed/${userId}/${resumePhoto.photo.id}_${resumePhoto.resume.id}`,
      {
        maxWidth,
        maxHeight,
        quality: 85,
        crop: cropData,
      }
    );

    // Update resume_photos record
    await db
      .update(resumePhotos)
      .set({
        processedPath: processedResult.path,
        cropData: JSON.stringify(cropData),
        updatedAt: new Date(),
      })
      .where(eq(resumePhotos.id, resumePhotoId));

    return NextResponse.json({
      success: true,
      url: getPublicUrl(processedResult.path),
      cropData,
    });
  } catch (error) {
    console.error("Error re-cropping photo:", error);
    return NextResponse.json(
      { error: "Failed to update crop" },
      { status: 500 }
    );
  }
}
