import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { db } from "@/db";
import { resumePhotos, resumes } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import type { SQL } from "drizzle-orm";
import { deleteFromMinio } from "@/lib/minio";
import { logger } from "@/lib/logger";

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { resumeId, resumePhotoId, photoId } = body;

    if (!resumeId && !resumePhotoId && !photoId) {
      return NextResponse.json(
        { error: "Missing resumeId, resumePhotoId, or photoId" },
        { status: 400 }
      );
    }

    const userId = session.user.id;

    // Build query condition - prefer resumePhotoId, then resumeId, then photoId as fallback
    let condition: SQL<unknown>;
    if (resumePhotoId) {
      condition = eq(resumePhotos.id, resumePhotoId);
    } else if (resumeId) {
      condition = eq(resumePhotos.resumeId, resumeId);
    } else {
      // Legacy fallback: photoId might be the resumePhotoId
      condition = eq(resumePhotos.id, photoId!);
    }

    // Fetch resume photo with ownership verification
    const [resumePhotoRecord] = await db
      .select({
        resumePhoto: resumePhotos,
        resume: resumes,
      })
      .from(resumePhotos)
      .innerJoin(resumes, eq(resumePhotos.resumeId, resumes.id))
      .where(and(eq(resumes.userId, userId), condition))
      .limit(1);

    if (!resumePhotoRecord) {
      return NextResponse.json(
        { error: "Resume photo not found or access denied" },
        { status: 404 }
      );
    }

    // Delete processed image from MinIO
    try {
      await deleteFromMinio(resumePhotoRecord.resumePhoto.processedPath);
    } catch (error) {
      logger.warn(
        "Failed to delete processed image from MinIO",
        { resumePhotoId: resumePhotoRecord.resumePhoto.id },
        error instanceof Error ? error : undefined
      );
      // Continue even if deletion fails
    }

    // Delete resume_photos record
    await db
      .delete(resumePhotos)
      .where(eq(resumePhotos.id, resumePhotoRecord.resumePhoto.id));

    return NextResponse.json({
      success: true,
      message: "Photo detached successfully",
    });
  } catch (error) {
    logger.error(
      "Error detaching photo",
      error instanceof Error ? error : undefined
    );
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      {
        error: "Failed to detach photo",
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}
