"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Plus, Trash2, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCVStore } from "@/store/useCVStore";
import { createEmptyCVState } from "@/lib/resume/defaultCvState";
import { authClient } from "@/lib/auth/auth-client";
import { OnboardingModal } from "@/components/onboarding/OnboardingModal";
import { SubscriptionModal } from "@/components/subscription/SubscriptionModal";
import { fetchOnboardingStatus } from "@/lib/api/onboarding";
import { fetchSubscriptionStatus } from "@/lib/api/subscriptions";
import { deleteResume, fetchResumeList, saveResume } from "@/lib/api/resumes";
import { logger } from "@/lib/logger";
import { TEMPLATE_GALLERY } from "@/lib/dashboard-templates";
import { bullseyeFontVars } from "./fonts";
import { BullseyeSidebar } from "@/components/dashboard/bullseye/BullseyeSidebar";
import { BullseyeTopbar } from "@/components/dashboard/bullseye/BullseyeTopbar";
import { BullseyeTemplateCard } from "@/components/dashboard/bullseye/BullseyeTemplateCard";
import { Bullseye } from "@/components/dashboard/bullseye/Bullseye";
import type { ResumeSummary } from "@contracts/resume";

type ResumeVersion = ResumeSummary;

const templateOptions = [
  { id: "ats-pure", label: "ATS Pure (parser-safe)" },
  { id: "ats-chronological", label: "ATS Chronological" },
  { id: "engineer", label: "Engineer" },
  { id: "timeline", label: "Timeline (Consultant)" },
  { id: "photo-first", label: "Photo First" },
  { id: "classic", label: "Classic" },
  { id: "modern", label: "Modern" },
  { id: "modern-minimalist", label: "Modern Minimalist" },
  { id: "elegant", label: "Elegant" },
  { id: "executive", label: "Executive" },
  { id: "creative", label: "Creative" },
  { id: "minimalist", label: "Minimalist" },
  { id: "professional", label: "Professional" },
  { id: "bold", label: "Bold" },
  { id: "sidebar", label: "Sidebar" },
  { id: "designer", label: "Designer" },
  { id: "tech", label: "Tech" },
  { id: "academic", label: "Academic" },
  { id: "corporate", label: "Corporate" },
  { id: "startup", label: "Startup" },
  { id: "compact", label: "Compact" },
] as const;

const dateFmt = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
});

function formatUpdated(iso: string | null): string {
  if (!iso) return "not yet";
  try {
    return dateFmt.format(new Date(iso));
  } catch {
    return "—";
  }
}

function relativeTime(iso: string | null): string {
  if (!iso) return "—";
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.round(diff / 60000);
  if (m < 1) return "now";
  if (m < 60) return `${m}m`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.round(h / 24);
  if (d < 30) return `${d}d`;
  const mo = Math.round(d / 30);
  if (mo < 12) return `${mo}mo`;
  return `${Math.round(mo / 12)}y`;
}

export default function Dashboard() {
  const { setTemplate } = useCVStore();
  const router = useRouter();
  const [versions, setVersions] = useState<ResumeVersion[]>([]);
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createTemplate, setCreateTemplate] = useState<string>(templateOptions[0].id);
  const [createTitle, setCreateTitle] = useState("New Resume");
  const [createError, setCreateError] = useState<string | null>(null);
  const [resumeToDelete, setResumeToDelete] = useState<ResumeVersion | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isCheckingOnboarding, setIsCheckingOnboarding] = useState(true);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [hasActiveSub, setHasActiveSub] = useState<boolean | null>(null);
  const { data: session, isPending: isSessionPending } = authClient.useSession();

  const fetchVersions = useCallback(async (selectedId?: string | null) => {
    setIsLoading(true);
    try {
      const data = await fetchResumeList();
      setVersions(data.resumes ?? []);
      setSelectedVersionId(selectedId ?? data.resumes?.[0]?.id ?? null);
    } catch (error) {
      logger.error(
        "Failed to load resumes",
        error instanceof Error ? error : undefined
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void fetchVersions();
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, [fetchVersions]);

  // Warm the editor route so the first click feels instant.
  useEffect(() => {
    router.prefetch("/editor");
  }, [router]);

  // Subscription status drives the free-plan banner (hidden on error).
  useEffect(() => {
    let cancelled = false;
    fetchSubscriptionStatus()
      .then((data) => {
        if (!cancelled) setHasActiveSub(Boolean(data?.hasActiveSubscription));
      })
      .catch(() => {
        if (!cancelled) setHasActiveSub(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Check for subscription query parameter
  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const params = new URLSearchParams(window.location.search);
      if (params.get("subscription") === "required") {
        setShowSubscriptionModal(true);
        window.history.replaceState({}, "", "/dashboard");
      }
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, []);

  // Check onboarding status
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (isSessionPending || !session?.user) {
        setIsCheckingOnboarding(false);
        return;
      }

      const localComplete = localStorage.getItem("onboarding_completed");
      if (localComplete === "true") {
        setShowOnboarding(false);
        setIsCheckingOnboarding(false);
        return;
      }

      try {
        const data = await fetchOnboardingStatus();
        if (data.hasCompletedOnboarding) {
          localStorage.setItem("onboarding_completed", "true");
          setShowOnboarding(false);
        } else {
          setShowOnboarding(true);
        }
      } catch (error) {
        logger.error(
          "Failed to check onboarding status",
          error instanceof Error ? error : undefined
        );
        setShowOnboarding(true);
      } finally {
        setIsCheckingOnboarding(false);
      }
    };

    checkOnboardingStatus();
  }, [session, isSessionPending]);

  const handleOnboardingComplete = () => setShowOnboarding(false);
  const handleOnboardingSkip = () => setShowOnboarding(false);

  const startCreateFlow = (templateId?: string, name?: string) => {
    setCreateTemplate(templateId ?? templateOptions[0].id);
    setCreateTitle(name ?? "New Resume");
    setCreateError(null);
    setIsCreateModalOpen(true);
  };

  const handleConfirmCreate = async () => {
    if (!createTitle.trim()) {
      setCreateError("Please provide a name for your CV.");
      return;
    }
    setIsCreateModalOpen(false);
    await createResumeVersion(createTemplate, createTitle.trim());
  };

  const handleCancelCreate = () => {
    setIsCreateModalOpen(false);
    setCreateError(null);
  };

  const handleSelectVersion = (resumeId: string) => {
    setSelectedVersionId(resumeId);
    router.push(`/editor?resumeId=${resumeId}`);
  };

  const createResumeVersion = useCallback(
    async (templateId: string, title: string) => {
      try {
        setIsCreating(true);
        setTemplate(templateId);
        const initialState = createEmptyCVState();
        const payload = {
          content: { ...initialState, selectedTemplate: templateId },
          title: title || "New Resume",
          createNew: true,
        };
        const result = await saveResume(payload);
        await fetchVersions(result.id);
        router.push(`/editor?resumeId=${result.id}`);
      } catch (error) {
        logger.error(
          "Failed to create resume",
          error instanceof Error ? error : undefined
        );
      } finally {
        setIsCreating(false);
      }
    },
    [fetchVersions, router, setTemplate]
  );

  const requestDeleteVersion = (version: ResumeVersion) => setResumeToDelete(version);

  const handleDeleteVersion = async () => {
    if (!resumeToDelete) return;
    try {
      setIsDeleting(true);
      await deleteResume(resumeToDelete.id);
      const nextSelected =
        resumeToDelete.id === selectedVersionId ? null : selectedVersionId;
      await fetchVersions(nextSelected);
    } catch (error) {
      logger.error(
        "Failed to delete resume",
        error instanceof Error ? error : undefined
      );
    } finally {
      setIsDeleting(false);
      setResumeToDelete(null);
    }
  };

  const handleNavEditor = () => {
    const target = selectedVersionId ?? versions[0]?.id;
    if (target) router.push(`/editor?resumeId=${target}`);
    else startCreateFlow();
  };

  const userName = session?.user?.name || "User";
  const userEmail = session?.user?.email || "";
  const userImage = session?.user?.image ?? null;
  const showBanner = hasActiveSub === false;

  return (
    <div
      className={`${bullseyeFontVars} text-[#1B1815] [font-family:var(--font-hanken)]`}
    >
      {!isCheckingOnboarding && (
        <OnboardingModal
          isOpen={showOnboarding}
          onComplete={handleOnboardingComplete}
          onSkip={handleOnboardingSkip}
        />
      )}

      <div className="flex h-screen w-full overflow-hidden bg-[#EDE7DC]">
        <BullseyeSidebar
          active="dashboard"
          versions={versions}
          selectedVersionId={selectedVersionId}
          onSelectVersion={handleSelectVersion}
          onCreateVersion={() => startCreateFlow()}
          isLoading={isLoading}
          isCreating={isCreating}
          userName={userName}
          userEmail={userEmail}
          onUpgrade={() => setShowSubscriptionModal(true)}
          onNavEditor={handleNavEditor}
        />

        <main className="flex min-w-0 flex-1 flex-col">
          <BullseyeTopbar
            viewTitle="Dashboard"
            userName={userName}
            userEmail={userEmail}
            userImage={userImage}
          />

          <div className="flex-1 overflow-y-auto px-5 pb-16 pt-8 sm:px-8 lg:px-[52px] lg:pt-[38px]">
            <div className="mx-auto max-w-[1120px]">
              {/* Free-plan banner */}
              {showBanner && (
                <div className="mb-7 flex items-center gap-4 rounded-[14px] border border-[#EBD9B8] bg-[linear-gradient(180deg,#FCF6E8,#FBF1DC)] px-[18px] py-[15px]">
                  <div className="flex h-[34px] w-[34px] flex-none items-center justify-center rounded-[9px] bg-[#F4E2B6]">
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                      <circle cx="9" cy="9" r="7.3" stroke="#B5781F" strokeWidth="1.5" />
                      <path d="M9 5.2v4.4" stroke="#B5781F" strokeWidth="1.6" strokeLinecap="round" />
                      <circle cx="9" cy="12.4" r="0.9" fill="#B5781F" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="text-[14.5px] font-semibold text-[#5C4A1E]">
                      You&apos;re on the free plan
                    </div>
                    <div className="mt-px text-[13px] text-[#8a7335]">
                      Subscribe to unlock PDF downloads and premium layouts.
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowSubscriptionModal(true)}
                    className="whitespace-nowrap text-[13.5px] font-semibold text-[#B5781F]"
                  >
                    View plans&nbsp;→
                  </button>
                </div>
              )}

              {/* Hero */}
              <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
                <div>
                  <div className="text-[11px] tracking-[0.18em] text-[#A39A8C] [font-family:var(--font-spline-mono)]">
                    WORKSPACE
                  </div>
                  <h1 className="mb-2 mt-[10px] text-[34px] font-normal leading-[1.05] tracking-[-0.02em] [font-family:var(--font-spectral)] sm:text-[44px]">
                    Aim your next role.
                  </h1>
                  <p className="m-0 max-w-[520px] text-[15.5px] text-[#6B655C]">
                    Build, tailor and manage every CV version — then fire your best
                    shot at the job.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => startCreateFlow()}
                  disabled={isCreating}
                  className="inline-flex items-center gap-[9px] self-start whitespace-nowrap rounded-[11px] bg-[#DB4B2E] px-5 py-[13px] text-[14.5px] font-semibold text-white shadow-[0_8px_20px_-8px_rgba(219,75,46,0.6)] transition-colors hover:bg-[#C03E22] disabled:opacity-70"
                >
                  <Plus size={18} strokeWidth={2.2} />
                  {isCreating ? "Creating…" : "New résumé"}
                </button>
              </div>

              {/* My CV versions */}
              <div className="mb-4 mt-10 flex flex-wrap items-baseline gap-x-[14px] gap-y-1">
                <h2 className="m-0 text-[22px] font-medium [font-family:var(--font-spectral)]">
                  My CV versions
                </h2>
                <span className="text-[13px] text-[#A39A8C]">
                  Switch and tailor for different roles.
                </span>
                <button
                  type="button"
                  onClick={() => fetchVersions(selectedVersionId)}
                  className="ml-auto inline-flex items-center gap-1.5 text-[13px] text-[#8C857C] transition-colors hover:text-[#1B1815]"
                >
                  <RefreshCw size={13} /> Refresh
                </button>
              </div>

              <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-[18px]">
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <div
                      key={`sk-${i}`}
                      className="h-[188px] animate-pulse rounded-[15px] border border-[#E7E1D8] bg-white"
                    />
                  ))
                ) : versions.length === 0 ? (
                  <div className="col-span-full rounded-[15px] border border-dashed border-[#D8CFC0] bg-[#FBF8F3] px-6 py-10 text-center">
                    <p className="text-[15px] text-[#6B655C]">
                      No résumé versions yet.
                    </p>
                    <button
                      type="button"
                      onClick={() => startCreateFlow()}
                      className="mt-3 inline-flex items-center gap-2 rounded-[10px] bg-[#1B1815] px-4 py-2.5 text-[13.5px] font-semibold text-[#FCFAF6] transition-colors hover:bg-[#332e28]"
                    >
                      <Plus size={16} /> Create your first
                    </button>
                  </div>
                ) : (
                  versions.map((v) => {
                    const active = v.id === selectedVersionId;
                    return (
                      <div
                        key={v.id}
                        className="rounded-[15px] border border-[#E7E1D8] bg-white p-[18px_19px] shadow-[0_1px_2px_rgba(27,24,21,0.05),0_14px_32px_-20px_rgba(27,24,21,0.18)] transition-all duration-150 hover:-translate-y-[2px] hover:shadow-[0_14px_30px_-16px_rgba(27,24,21,0.2)]"
                      >
                        <div className="flex items-start justify-between gap-[10px]">
                          <div className="min-w-0">
                            <div className="truncate text-[17.5px] text-[#1B1815] [font-family:var(--font-spectral)]">
                              {v.title}
                            </div>
                            <div className="mt-[3px] text-[12.5px] text-[#A39A8C]">
                              Updated {formatUpdated(v.updatedAt)}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => requestDeleteVersion(v)}
                            aria-label="Delete résumé"
                            className="flex-none text-[#C7BDAC] transition-colors hover:text-[#DB4B2E]"
                          >
                            <Trash2 size={17} />
                          </button>
                        </div>

                        <div className="my-4 flex items-center gap-[11px] rounded-[11px] bg-[#FAF7F1] p-3">
                          <Bullseye size={30} gap="#FAF7F1" />
                          <div className="leading-[1.1]">
                            <div className="text-[23px] font-medium text-[#1B1815] [font-family:var(--font-spectral)]">
                              {relativeTime(v.updatedAt)}
                            </div>
                            <div className="mt-0.5 text-[9.5px] tracking-[0.1em] text-[#A39A8C] [font-family:var(--font-spline-mono)]">
                              LAST&nbsp;EDIT
                            </div>
                          </div>
                          {active && (
                            <span className="ml-auto text-[11.5px] font-semibold text-[#DB4B2E]">
                              Selected
                            </span>
                          )}
                        </div>

                        <div className="flex gap-[9px]">
                          <button
                            type="button"
                            onClick={() => handleSelectVersion(v.id)}
                            className="flex-1 rounded-[9px] bg-[#1B1815] py-2.5 text-[13.5px] font-semibold text-[#FCFAF6] transition-colors hover:bg-[#332e28]"
                          >
                            Continue editing
                          </button>
                          <button
                            type="button"
                            onClick={() => router.push(`/editor?resumeId=${v.id}`)}
                            className="rounded-[9px] border border-[#E0D9CD] bg-white px-4 py-2.5 text-[13.5px] font-semibold text-[#3D372F] transition-colors hover:border-[#1B1815]"
                          >
                            Open
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Templates */}
              <div
                id="templates"
                className="mb-4 mt-11 flex flex-wrap items-baseline gap-x-[14px] gap-y-1 scroll-mt-6"
              >
                <h2 className="m-0 text-[22px] font-medium [font-family:var(--font-spectral)]">
                  Start from a template
                </h2>
                <span className="text-[13px] text-[#A39A8C]">
                  {TEMPLATE_GALLERY.length} layouts — ATS-safe to expressive.
                </span>
              </div>

              <div className="grid grid-cols-[repeat(auto-fill,minmax(208px,1fr))] gap-[18px]">
                <button
                  type="button"
                  onClick={() => startCreateFlow()}
                  className="flex min-h-[300px] flex-col items-center justify-center rounded-[16px] border-[1.5px] border-dashed border-[#C9C0B1] bg-[#FBF8F3] p-6 text-center transition-colors hover:border-[#DB4B2E] hover:bg-[#FDF3EE] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DB4B2E] focus-visible:ring-offset-2 focus-visible:ring-offset-[#EDE7DC]"
                >
                  <Bullseye size={52} gap="#FBF8F3" className="mb-4" />
                  <div className="text-[18px] text-[#1B1815] [font-family:var(--font-spectral)]">
                    Blank résumé
                  </div>
                  <div className="mt-[5px] max-w-[160px] text-[13px] text-[#A39A8C]">
                    Start from a clean, structured layout.
                  </div>
                </button>

                {TEMPLATE_GALLERY.map((template) => (
                  <BullseyeTemplateCard
                    key={template.id}
                    template={template}
                    onSelect={(id, title) => startCreateFlow(id, title)}
                  />
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>

      <SubscriptionModal
        isOpen={showSubscriptionModal}
        onClose={() => setShowSubscriptionModal(false)}
        trigger="manual"
      />

      {/* Create modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-[rgba(27,24,21,0.45)] px-4 backdrop-blur-sm">
          <div className="w-full max-w-md space-y-5 rounded-[16px] border border-[#E7E1D8] bg-[#FCFAF6] p-6 shadow-[0_30px_70px_-20px_rgba(27,24,21,0.45)]">
            <div>
              <h3 className="text-[22px] [font-family:var(--font-spectral)]">
                Create new résumé
              </h3>
              <p className="text-[13.5px] text-[#6B655C]">
                Choose a template and give it a name.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#8C857C]">
                  Name
                </label>
                <input
                  type="text"
                  value={createTitle}
                  onChange={(e) => setCreateTitle(e.target.value)}
                  className="mt-1.5 w-full rounded-[9px] border border-[#E0D9CD] bg-white px-3 py-2.5 text-[14px] text-[#1B1815] outline-none focus:border-[#DB4B2E]"
                  placeholder="e.g. Senior PM — Fintech"
                />
                {createError && (
                  <p className="mt-1 text-[13px] text-[#B83A21]">{createError}</p>
                )}
              </div>

              <div>
                <label className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#8C857C]">
                  Template
                </label>
                <select
                  value={createTemplate}
                  onChange={(e) => setCreateTemplate(e.target.value)}
                  className="mt-1.5 w-full rounded-[9px] border border-[#E0D9CD] bg-white px-3 py-2.5 text-[14px] text-[#1B1815] outline-none focus:border-[#DB4B2E]"
                >
                  {templateOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={handleCancelCreate}
                className="rounded-[9px] border border-[#E0D9CD] bg-white px-4 py-2.5 text-[13.5px] font-semibold text-[#3D372F] transition-colors hover:border-[#1B1815]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmCreate}
                className="rounded-[9px] bg-[#DB4B2E] px-5 py-2.5 text-[13.5px] font-semibold text-white transition-colors hover:bg-[#C03E22]"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete modal */}
      {resumeToDelete && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-[rgba(27,24,21,0.45)] px-4 backdrop-blur-sm">
          <div className="w-full max-w-md space-y-5 rounded-[16px] border border-[#E7E1D8] bg-[#FCFAF6] p-6 shadow-[0_30px_70px_-20px_rgba(27,24,21,0.45)]">
            <div>
              <h3 className="text-[22px] [font-family:var(--font-spectral)]">
                Delete résumé
              </h3>
              <p className="text-[13.5px] text-[#6B655C]">
                Delete{" "}
                <span className="font-semibold text-[#1B1815]">
                  {resumeToDelete.title || "Untitled Résumé"}
                </span>
                ? This can&apos;t be undone.
              </p>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setResumeToDelete(null)}
                disabled={isDeleting}
                className="rounded-[9px] border border-[#E0D9CD] bg-white px-4 py-2.5 text-[13.5px] font-semibold text-[#3D372F] transition-colors hover:border-[#1B1815] disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteVersion}
                disabled={isDeleting}
                className="rounded-[9px] bg-[#DB4B2E] px-5 py-2.5 text-[13.5px] font-semibold text-white transition-colors hover:bg-[#C03E22] disabled:opacity-70"
              >
                {isDeleting ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
