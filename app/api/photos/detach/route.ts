import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { db } from "@/db";
import { resumePhotos, resumes } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import type { SQL } from "drizzle-orm";
import { deleteFromMinio } from "@/lib/minio";

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

    console.log("[Detach] Request payload:", {
      resumeId,
      resumePhotoId,
      photoId,
    });

    if (!resumeId && !resumePhotoId && !photoId) {
      return NextResponse.json(
        { error: "Missing resumeId, resumePhotoId, or photoId" },
        { status: 400 }
      );
    }

    const userId = session.user.id;
    console.log("[Detach] User ID:", userId);

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
    console.log(
      "[Detach] Querying with condition type:",
      resumePhotoId ? "resumePhotoId" : resumeId ? "resumeId" : "photoId"
    );

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
      console.error("[Detach] Resume photo not found for user:", userId);
      return NextResponse.json(
        { error: "Resume photo not found or access denied" },
        { status: 404 }
      );
    }

    console.log("[Detach] Found resume photo:", {
      id: resumePhotoRecord.resumePhoto.id,
      resumeId: resumePhotoRecord.resumePhoto.resumeId,
      photoId: resumePhotoRecord.resumePhoto.photoId,
      processedPath: resumePhotoRecord.resumePhoto.processedPath,
    });

    // Delete processed image from MinIO
    try {
      console.log(
        "[Detach] Deleting from MinIO:",
        resumePhotoRecord.resumePhoto.processedPath
      );
      await deleteFromMinio(resumePhotoRecord.resumePhoto.processedPath);
      console.log("[Detach] Successfully deleted from MinIO");
    } catch (error) {
      console.warn(
        "[Detach] Failed to delete processed image from MinIO:",
        error
      );
      // Continue even if deletion fails
    }

    // Delete resume_photos record
    console.log(
      "[Detach] Deleting resume_photos record:",
      resumePhotoRecord.resumePhoto.id
    );
    await db
      .delete(resumePhotos)
      .where(eq(resumePhotos.id, resumePhotoRecord.resumePhoto.id));

    console.log("[Detach] Successfully detached photo");
    return NextResponse.json({
      success: true,
      message: "Photo detached successfully",
    });
  } catch (error) {
    console.error("Error detaching photo:", error);
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
