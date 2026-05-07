import { describe, expect, it } from "vitest";

import type { SaveResumeRequest } from "@/contracts/resume";

import { mapSaveRequestToResumeValues } from "./mappers";

describe("mapSaveRequestToResumeValues", () => {
  it("preserves nested design settings in persisted resume values", () => {
    const payload: SaveResumeRequest = {
      title: "Platform Resume",
      content: {
        personalInfo: {
          fullName: "Jane Doe",
          email: "jane@example.com",
          phone: "+1 555 111 2222",
          address: "Berlin",
          summary: "Experienced backend engineer",
          title: "Senior Engineer",
        },
        education: [],
        experience: [],
        skills: [
          {
            name: "TypeScript",
            level: 5,
          },
        ],
        selectedTemplate: "modern",
        designSettings: {
          themeColor: "#112233",
          fontFamily: "mono",
          scale: 1.15,
          textAlignment: "center",
          fontSizes: {
            header: 2.8,
            sectionTitle: 1.75,
            body: 1.1,
          },
          spacing: {
            lineHeight: 1.9,
            sectionPadding: 2.5,
            itemGap: 1.25,
          },
        },
      },
    };

    const result = mapSaveRequestToResumeValues(payload);

    expect(result.title).toBe("Platform Resume");
    expect(result.professionalTitle).toBe("Senior Engineer");
    expect(result.fontSizeHeader).toBe("2.8");
    expect(result.fontSizeSectionTitle).toBe("1.75");
    expect(result.fontSizeBody).toBe("1.1");
    expect(result.lineHeight).toBe("1.9");
    expect(result.sectionPadding).toBe("2.5");
    expect(result.itemGap).toBe("1.25");
    expect(result.textAlignment).toBe("center");
  });
});
