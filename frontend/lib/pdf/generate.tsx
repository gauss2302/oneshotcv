/**
 * Vector-text PDF export.
 *
 * Replaces the old html2canvas + jsPDF rasterizer. Output is a real PDF with
 * selectable, searchable text and ATS-readable structure.
 *
 * The full PDF stack (`@react-pdf/renderer`) weighs ~500 KB minified — we
 * lazy-load it via dynamic import so the editor's first paint isn't penalized.
 */

import React from "react";
import { CVState } from "@/types/cv";
import { logger } from "@/lib/logger";

interface BuildOptions {
  /** CV state from useCVStore */
  cv: CVState;
  /** Template id from store. Falls back to "classic". */
  templateId: string | undefined;
}

/**
 * Render the user's CV to a PDF Blob using React-PDF.
 * Pure, no DOM dependency — safe to call from anywhere.
 */
export async function buildPdfBlob({ cv, templateId }: BuildOptions): Promise<Blob> {
  // Lazy-load the heavy React-PDF stack on first use.
  const [{ pdf }, { PdfDocument }, { buildSpecForTemplate }] = await Promise.all([
    import("@react-pdf/renderer"),
    import("./components/PdfDocument"),
    import("./specs/builders"),
  ]);

  const spec = buildSpecForTemplate(templateId, {
    fullName: cv.personalInfo.fullName,
    title: cv.personalInfo.title,
    email: cv.personalInfo.email,
    phone: cv.personalInfo.phone,
    address: cv.personalInfo.address,
    summary: cv.personalInfo.summary,
    photo: cv.personalInfo.photo
      ? { url: cv.personalInfo.photo.url }
      : undefined,
    experience: cv.experience,
    education: cv.education,
    skills: cv.skills,
    designSettings: cv.designSettings,
  });

  const doc = pdf(<PdfDocument spec={spec} />);
  return doc.toBlob();
}

interface DownloadOptions extends BuildOptions {
  /** File name without extension */
  filename?: string;
}

/**
 * Build the PDF and trigger a browser download.
 * Wraps `buildPdfBlob` with a click-to-download flow.
 */
export async function downloadPdf(options: DownloadOptions): Promise<void> {
  const { filename = "my-cv" } = options;
  try {
    const blob = await buildPdfBlob(options);

    // Trigger download via a temporary anchor — works in all evergreen browsers.
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename.endsWith(".pdf") ? filename : `${filename}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    // Free the blob after the click handler had a chance to fire.
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  } catch (error) {
    logger.error(
      "PDF generation failed",
      error instanceof Error ? error : undefined,
    );
    throw error;
  }
}
