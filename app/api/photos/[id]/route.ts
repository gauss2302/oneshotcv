import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { db } from "@/db";
import { photos, resumePhotos } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { deleteFromMinio } from "@/lib/minio";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: photoId } = await params;
    const userId = session.user.id;
    const url = new URL(req.url);
    const force = url.searchParams.get('force') === 'true';

    // Get photo with ownership check
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

    // Check if photo is in use by any resume
    const usages = await db
      .select()
      .from(resumePhotos)
      .where(eq(resumePhotos.photoId, photoId));

    if (usages.length > 0 && !force) {
      return NextResponse.json(
        {
          error: "Photo is in use",
          inUse: true,
          usageCount: usages.length,
          message: `This photo is used in ${usages.length} resume(s). Use force=true to delete anyway.`
        },
        { status: 409 }
      );
    }

    // If force delete, remove all resume_photos records and processed images
    if (force && usages.length > 0) {
      for (const usage of usages) {
        try {
          await deleteFromMinio(usage.processedPath);
        } catch (error) {
          console.warn("Failed to delete processed image:", error);
        }
      }
      await db.delete(resumePhotos).where(eq(resumePhotos.photoId, photoId));
    }

    // Delete original image from MinIO
    try {
      await deleteFromMinio(photo.originalPath);
    } catch (error) {
      console.warn("Failed to delete original image from MinIO:", error);
      // Continue even if deletion fails
    }

    // Delete photo record from database
    await db.delete(photos).where(eq(photos.id, photoId));

    return NextResponse.json({
      success: true,
      message: "Photo deleted successfully"
    });

  } catch (error) {
    console.error("Error deleting photo:", error);
    return NextResponse.json(
      { error: "Failed to delete photo" },
      { status: 500 }
    );
  }
}
