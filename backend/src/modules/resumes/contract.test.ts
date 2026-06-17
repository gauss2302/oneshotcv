import { describe, expect, it } from "vitest";

import {
  resumeDocumentSchema,
  saveResumeRequestSchema,
  saveResumeResponseSchema,
} from "@/contracts/resume";

const validContent = {
  personalInfo: {
    fullName: "Jane Doe",
    email: "jane@example.com",
    phone: "",
    address: "",
    summary: "",
    title: "",
  },
  education: [],
  experience: [],
  skills: [],
  selectedTemplate: "classic",
  designSettings: {
    themeColor: "#112233",
    fontFamily: "sans",
    scale: 1,
    textAlignment: "left",
    fontSizes: {
      header: 2.25,
      sectionTitle: 1.5,
      body: 1,
    },
    spacing: {
      lineHeight: 1.6,
      sectionPadding: 2,
      itemGap: 1,
    },
  },
} as const;

describe("resume contract versioning", () => {
  it("requires loaded resume documents to carry a version", () => {
    const parsed = resumeDocumentSchema.parse({
      id: "3c1234bc-3133-47d4-9a53-0468bfb8bb2b",
      title: "Frontend Engineer CV",
      version: 7,
      content: validContent,
    });

    expect(parsed.version).toBe(7);
  });

  it("accepts optimistic concurrency version on save requests", () => {
    const parsed = saveResumeRequestSchema.parse({
      id: "3c1234bc-3133-47d4-9a53-0468bfb8bb2b",
      version: 7,
      content: validContent,
    });

    expect(parsed.version).toBe(7);
  });

  it("returns the next server version after save", () => {
    const parsed = saveResumeResponseSchema.parse({
      success: true,
      id: "3c1234bc-3133-47d4-9a53-0468bfb8bb2b",
      version: 8,
    });

    expect(parsed.version).toBe(8);
  });
});
