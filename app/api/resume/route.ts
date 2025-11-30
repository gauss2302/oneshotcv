/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { db } from "@/db";
import { resumes, education, experience, skills } from "@/db/schema";
import { and, eq } from "drizzle-orm";

// Helper: Convert DB record to API response format
function formatResumeResponse(
  resume: typeof resumes.$inferSelect & {
    education?: (typeof education.$inferSelect)[];
    experience?: (typeof experience.$inferSelect)[];
    skills?: (typeof skills.$inferSelect)[];
  }
) {
  return {
    id: resume.id,
    title: resume.title,
    content: {
      personalInfo: {
        fullName: resume.fullName,
        email: resume.email,
        phone: resume.phone ?? "",
        address: resume.address ?? "",
      },
      summary: resume.summary ?? "",
      selectedTemplate: resume.selectedTemplate,
      designSettings: {
        themeColor: resume.themeColor,
        fontFamily: resume.fontFamily,
        fontSizeHeader: Number(resume.fontSizeHeader),
        fontSizeSectionTitle: Number(resume.fontSizeSectionTitle),
        fontSizeBody: Number(resume.fontSizeBody),
        scale: Number(resume.scale),
        lineHeight: Number(resume.lineHeight),
        sectionPadding: Number(resume.sectionPadding),
        itemGap: Number(resume.itemGap),
        textAlignment: resume.textAlignment,
      },
      education:
        resume.education?.map((edu) => ({
          id: edu.id,
          institution: edu.institution,
          degree: edu.degree ?? "",
          startDate: edu.startDate ?? "",
          endDate: edu.endDate ?? "",
          description: edu.description ?? "",
        })) ?? [],
      experience:
        resume.experience?.map((exp) => ({
          id: exp.id,
          company: exp.company,
          position: exp.position,
          startDate: exp.startDate ?? "",
          endDate: exp.endDate ?? "",
          location: exp.location ?? "",
          description: exp.description ?? "",
          isCurrent: exp.isCurrent,
        })) ?? [],
      skills:
        resume.skills?.map((skill) => ({
          id: skill.id,
          name: skill.name,
          level: skill.level,
        })) ?? [],
    },
  };
}

export async function GET(request: Request) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const requestedId = searchParams.get("id");

  const resume = await db.query.resumes.findFirst({
    where: requestedId
      ? and(eq(resumes.userId, session.user.id), eq(resumes.id, requestedId))
      : eq(resumes.userId, session.user.id),
    with: {
      education: true,
      experience: true,
      skills: true,
    },
  });

  if (!resume) {
    return NextResponse.json({ content: null });
  }

  return NextResponse.json(formatResumeResponse(resume));
}

export async function POST(req: Request) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { content, id: resumeId, title, createNew } = body;

  if (!content) {
    return NextResponse.json({ error: "Content is required" }, { status: 400 });
  }

  // Extract data from content object
  const { personalInfo, designSettings, summary, selectedTemplate } = content;

  const resumeData = {
    fullName: personalInfo?.fullName ?? "Untitled",
    email: personalInfo?.email ?? "",
    phone: personalInfo?.phone ?? null,
    address: personalInfo?.address ?? null,
    title: title ?? content.title ?? null,
    summary: summary ?? null,
    selectedTemplate: selectedTemplate ?? "professional",
    themeColor: designSettings?.themeColor ?? "#3b82f6",
    fontFamily: designSettings?.fontFamily ?? "sans",
    fontSizeHeader: String(designSettings?.fontSizeHeader ?? 2.25),
    fontSizeSectionTitle: String(designSettings?.fontSizeSectionTitle ?? 1.5),
    fontSizeBody: String(designSettings?.fontSizeBody ?? 1),
    scale: String(designSettings?.scale ?? 0.7),
    lineHeight: String(designSettings?.lineHeight ?? 1.6),
    sectionPadding: String(designSettings?.sectionPadding ?? 2),
    itemGap: String(designSettings?.itemGap ?? 1),
    textAlignment: designSettings?.textAlignment ?? "justify",
    updatedAt: new Date(),
  };

  // Helper to sync related data (education, experience, skills)
  async function syncRelatedData(resumeId: string) {
    // Sync Education
    if (content.education) {
      await db.delete(education).where(eq(education.resumeId, resumeId));
      if (content.education.length > 0) {
        await db.insert(education).values(
          content.education.map((edu: any) => ({
            resumeId,
            institution: edu.institution ?? "",
            degree: edu.degree ?? null,
            startDate: edu.startDate ?? null,
            endDate: edu.endDate ?? null,
            description: edu.description ?? null,
          }))
        );
      }
    }

    // Sync Experience
    if (content.experience) {
      await db.delete(experience).where(eq(experience.resumeId, resumeId));
      if (content.experience.length > 0) {
        await db.insert(experience).values(
          content.experience.map((exp: any, index: number) => ({
            resumeId,
            company: exp.company ?? "",
            position: exp.position ?? "",
            startDate: exp.startDate ?? null,
            endDate: exp.endDate ?? null,
            location: exp.location ?? null,
            description: exp.description ?? null,
            isCurrent: exp.isCurrent ?? false,
            sortOrder: index,
          }))
        );
      }
    }

    // Sync Skills
    if (content.skills) {
      await db.delete(skills).where(eq(skills.resumeId, resumeId));
      if (content.skills.length > 0) {
        await db.insert(skills).values(
          content.skills.map((skill: any, index: number) => ({
            resumeId,
            name: skill.name ?? "",
            level: skill.level ?? 50,
            sortOrder: index,
          }))
        );
      }
    }
  }

  // Update existing resume by ID
  if (resumeId) {
    await db
      .update(resumes)
      .set(resumeData)
      .where(
        and(eq(resumes.id, resumeId), eq(resumes.userId, session.user.id))
      );

    await syncRelatedData(resumeId);
    return NextResponse.json({ success: true, id: resumeId });
  }

  // Create new resume
  if (createNew) {
    const [newResume] = await db
      .insert(resumes)
      .values({
        ...resumeData,
        userId: session.user.id,
      })
      .returning({ id: resumes.id });

    await syncRelatedData(newResume.id);
    return NextResponse.json({ success: true, id: newResume.id });
  }

  // Find existing resume or create new one
  const existingResume = await db.query.resumes.findFirst({
    where: eq(resumes.userId, session.user.id),
  });

  if (existingResume) {
    await db
      .update(resumes)
      .set(resumeData)
      .where(eq(resumes.id, existingResume.id));

    await syncRelatedData(existingResume.id);
    return NextResponse.json({ success: true, id: existingResume.id });
  }

  // Create fallback resume
  const [fallbackResume] = await db
    .insert(resumes)
    .values({
      ...resumeData,
      userId: session.user.id,
    })
    .returning({ id: resumes.id });

  await syncRelatedData(fallbackResume.id);
  return NextResponse.json({ success: true, id: fallbackResume.id });
}

export async function DELETE(req: Request) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { id } = body;

  if (!id) {
    return NextResponse.json(
      { error: "Resume id is required" },
      { status: 400 }
    );
  }

  // Related data (education, experience, skills) will be deleted automatically
  // due to CASCADE on the foreign key
  await db
    .delete(resumes)
    .where(and(eq(resumes.id, id), eq(resumes.userId, session.user.id)));

  return NextResponse.json({ success: true });
}
