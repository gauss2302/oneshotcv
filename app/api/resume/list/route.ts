import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { db } from "@/db";
import { resumes } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json({ resumes: [] });
  }

  const rows = await db
    .select({
      id: resumes.id,
      title: resumes.title,
      updatedAt: resumes.updatedAt,
    })
    .from(resumes)
    .where(eq(resumes.userId, session.user.id))
    .orderBy(desc(resumes.updatedAt));

  const result = rows.map((row) => ({
    id: row.id,
    title: row.title ?? "Untitled Resume",
    updatedAt: row.updatedAt ?? null,
  }));

  return NextResponse.json({ resumes: result });
}
