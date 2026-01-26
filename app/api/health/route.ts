import { NextResponse } from "next/server";
import { db } from "@/db";
import { sql } from "drizzle-orm";
import { getMinioClient, getBucketName } from "@/lib/minio";

/**
 * Health check endpoint for Dokploy
 * Checks database and MinIO connectivity
 */
export async function GET() {
  const checks: Record<string, { status: "healthy" | "unhealthy"; message?: string }> = {};

  // Check database connectivity
  try {
    await db.execute(sql`SELECT 1`);
    checks.database = { status: "healthy" };
  } catch (error) {
    checks.database = {
      status: "unhealthy",
      message: error instanceof Error ? error.message : "Database connection failed",
    };
  }

  // Check MinIO connectivity
  try {
    const client = getMinioClient();
    const bucketName = getBucketName();
    await client.bucketExists(bucketName);
    checks.storage = { status: "healthy" };
  } catch (error) {
    checks.storage = {
      status: "unhealthy",
      message: error instanceof Error ? error.message : "MinIO connection failed",
    };
  }

  // Determine overall health
  const allHealthy = Object.values(checks).every((check) => check.status === "healthy");
  const statusCode = allHealthy ? 200 : 503;

  return NextResponse.json(
    {
      status: allHealthy ? "healthy" : "unhealthy",
      timestamp: new Date().toISOString(),
      checks,
    },
    { status: statusCode }
  );
}
