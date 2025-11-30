import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { db } from "@/db";
import { photos } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { getPublicUrl } from "@/lib/minio";

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    console.log("[Photo Library] Fetching photos for user:", userId);

    // Get all active photos for the user, newest first
    const userPhotos = await db
      .select()
      .from(photos)
      .where(eq(photos.userId, userId))
      .orderBy(desc(photos.createdAt));

    console.log("[Photo Library] Found", userPhotos.length, "photos");

    // Return photos with original URLs for thumbnails
    const photosWithUrls = userPhotos.map(photo => ({
      id: photo.id,
      fileName: photo.fileName,
      fileSize: photo.fileSize,
      width: photo.width,
      height: photo.height,
      originalUrl: getPublicUrl(photo.originalPath),
      createdAt: photo.createdAt,
    }));

    console.log("[Photo Library] Sample photo URLs:", photosWithUrls.slice(0, 2).map(p => ({
      id: p.id,
      url: p.originalUrl
    })));

    return NextResponse.json({
      success: true,
      photos: photosWithUrls,
    });

  } catch (error) {
    console.error("Error fetching photo library:", error);
    return NextResponse.json(
      { error: "Failed to fetch photos" },
      { status: 500 }
    );
  }
}
