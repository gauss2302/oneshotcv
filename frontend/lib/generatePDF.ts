/**
 * PDF export entry point.
 *
 * As of Phase 1b this delegates to the new vector-text React-PDF pipeline
 * (`lib/pdf/generate.tsx`). The previous html2canvas implementation rasterized
 * the on-screen DOM into a JPEG and embedded it in the PDF, which produced a
 * non-selectable, non-ATS-friendly, blurry export. The new pipeline emits a
 * real PDF with selectable text and proper structure.
 *
 * The PDF is built directly from the Zustand store (the source of truth),
 * so the output never drifts from the data the user sees in the editor —
 * even if the on-screen preview is mid-render.
 */

import { useCVStore } from "@/store/useCVStore";
import { checkSubscriptionStatus } from "./check-subscription";
import { downloadPdf } from "./pdf/generate";
import { logger } from "./logger";

/** Sanitize a string for use as a filename. */
function safeFilename(name: string): string {
  const trimmed = (name || "").trim();
  if (!trimmed) return "my-cv";
  return trimmed
    .replace(/[^\p{L}\p{N}\s_-]+/gu, "")
    .replace(/\s+/g, "_")
    .slice(0, 80) || "my-cv";
}

export const generatePDF = async (): Promise<void> => {
  // Subscription gate (kept identical to legacy behavior).
  try {
    const subscriptionStatus = await checkSubscriptionStatus();
    if (!subscriptionStatus.hasActiveSubscription) {
      const shouldProceed = window.confirm(
        "A subscription is required to download your resume as PDF.\n\n" +
          "Would you like to subscribe now?",
      );
      if (shouldProceed) {
        window.location.href = "/dashboard?subscription=required";
      }
      return;
    }
  } catch (error) {
    logger.error(
      "Error checking subscription",
      error instanceof Error ? error : undefined,
    );
    alert("Unable to verify subscription. Please try again later.");
    return;
  }

  // Pull the live CV state straight from the store. Reading via getState()
  // (instead of useStore() in a component) means the export uses the
  // committed data, not whatever React happens to be re-rendering.
  const state = useCVStore.getState();
  const cv = {
    personalInfo: state.personalInfo,
    education: state.education,
    experience: state.experience,
    skills: state.skills,
    designSettings: state.designSettings,
    selectedTemplate: state.selectedTemplate,
  };

  // File name: prefer full name, fall back to "my-cv".
  const filename = safeFilename(state.personalInfo.fullName || "my-cv");

  try {
    await downloadPdf({
      cv,
      templateId: state.selectedTemplate,
      filename,
    });
  } catch (error) {
    logger.error(
      "Error generating PDF",
      error instanceof Error ? error : undefined,
    );
    alert(
      "Failed to generate PDF. Please try again, or contact support if the problem persists.",
    );
  }
};
