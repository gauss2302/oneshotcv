import type { CVState } from "@/types/cv";
import type { SpecInput } from "../types";

function cleanText(value: string | null | undefined): string {
  return (value ?? "").trim();
}

function hasAnyText(...values: Array<string | null | undefined>): boolean {
  return values.some((value) => cleanText(value).length > 0);
}

function clampSkillLevel(level: number): number {
  if (!Number.isFinite(level)) {
    return 3;
  }

  return Math.min(5, Math.max(1, Math.round(level)));
}

export function buildSpecInputFromCv(cv: CVState): SpecInput {
  const personalInfo = cv.personalInfo;
  const address = cleanText(personalInfo.address) || cleanText(personalInfo.location);

  return {
    fullName: cleanText(personalInfo.fullName),
    title: cleanText(personalInfo.title),
    email: cleanText(personalInfo.email),
    phone: cleanText(personalInfo.phone),
    address,
    summary: cleanText(personalInfo.summary),
    photo: personalInfo.photo?.url
      ? {
          url: personalInfo.photo.url,
        }
      : undefined,
    experience: cv.experience
      .filter((item) =>
        hasAnyText(
          item.position,
          item.company,
          item.location,
          item.startDate,
          item.endDate,
          item.description
        )
      )
      .map((item) => ({
        id: item.id,
        position: cleanText(item.position),
        company: cleanText(item.company),
        location: cleanText(item.location),
        startDate: cleanText(item.startDate),
        endDate: cleanText(item.endDate),
        current: item.isCurrent ?? item.current ?? false,
        description: cleanText(item.description),
      })),
    education: cv.education
      .filter((item) =>
        hasAnyText(
          item.institution,
          item.degree,
          item.startDate,
          item.endDate,
          item.description
        )
      )
      .map((item) => ({
        id: item.id,
        institution: cleanText(item.institution),
        degree: cleanText(item.degree),
        startDate: cleanText(item.startDate),
        endDate: cleanText(item.endDate),
        current: item.current ?? false,
        description: cleanText(item.description),
      })),
    skills: cv.skills
      .filter((item) => cleanText(item.name).length > 0)
      .map((item) => ({
        id: item.id,
        name: cleanText(item.name),
        level: clampSkillLevel(item.level),
      })),
    designSettings: cv.designSettings,
  };
}
