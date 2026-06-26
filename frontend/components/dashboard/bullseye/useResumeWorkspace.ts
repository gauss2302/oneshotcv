"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCVStore } from "@/store/useCVStore";
import { createEmptyCVState } from "@/lib/resume/defaultCvState";
import { authClient } from "@/lib/auth/auth-client";
import { deleteResume, fetchResumeList, saveResume } from "@/lib/api/resumes";
import { logger } from "@/lib/logger";
import { TEMPLATE_GALLERY } from "@/lib/dashboard-templates";
import type { ResumeSummary } from "@contracts/resume";

export type ResumeVersion = ResumeSummary;

/**
 * Shared dashboard/templates state: the résumé-version list plus the
 * create and delete flows (with their modal state). Pages feed the result
 * into BullseyeShell, which renders the sidebar list and the shared modals.
 */
export function useResumeWorkspace() {
  const { setTemplate } = useCVStore();
  const router = useRouter();
  const { data: session } = authClient.useSession();

  const [versions, setVersions] = useState<ResumeVersion[]>([]);
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createTemplate, setCreateTemplate] = useState<string>(TEMPLATE_GALLERY[0].id);
  const [createTitle, setCreateTitle] = useState("New Resume");
  const [createError, setCreateError] = useState<string | null>(null);

  const [resumeToDelete, setResumeToDelete] = useState<ResumeVersion | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchVersions = useCallback(async (selectedId?: string | null) => {
    setIsLoading(true);
    try {
      const data = await fetchResumeList();
      setVersions(data.resumes ?? []);
      setSelectedVersionId(selectedId ?? data.resumes?.[0]?.id ?? null);
    } catch (error) {
      logger.error("Failed to load resumes", error instanceof Error ? error : undefined);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const t = window.setTimeout(() => void fetchVersions(), 0);
    return () => window.clearTimeout(t);
  }, [fetchVersions]);

  useEffect(() => {
    router.prefetch("/editor");
  }, [router]);

  const handleSelectVersion = useCallback(
    (id: string) => {
      setSelectedVersionId(id);
      router.push(`/editor?resumeId=${id}`);
    },
    [router]
  );

  const startCreateFlow = useCallback((templateId?: string, name?: string) => {
    setCreateTemplate(templateId ?? TEMPLATE_GALLERY[0].id);
    setCreateTitle(name ?? "New Resume");
    setCreateError(null);
    setIsCreateOpen(true);
  }, []);

  const createResumeVersion = useCallback(
    async (templateId: string, title: string) => {
      try {
        setIsCreating(true);
        setTemplate(templateId);
        const payload = {
          content: { ...createEmptyCVState(), selectedTemplate: templateId },
          title: title || "New Resume",
          createNew: true,
        };
        const result = await saveResume(payload);
        await fetchVersions(result.id);
        router.push(`/editor?resumeId=${result.id}`);
      } catch (error) {
        logger.error("Failed to create resume", error instanceof Error ? error : undefined);
      } finally {
        setIsCreating(false);
      }
    },
    [fetchVersions, router, setTemplate]
  );

  const handleConfirmCreate = useCallback(async () => {
    if (!createTitle.trim()) {
      setCreateError("Please provide a name for your CV.");
      return;
    }
    setIsCreateOpen(false);
    await createResumeVersion(createTemplate, createTitle.trim());
  }, [createTitle, createTemplate, createResumeVersion]);

  const handleCancelCreate = useCallback(() => {
    setIsCreateOpen(false);
    setCreateError(null);
  }, []);

  const requestDeleteVersion = useCallback((v: ResumeVersion) => setResumeToDelete(v), []);
  const cancelDelete = useCallback(() => setResumeToDelete(null), []);

  const handleDeleteVersion = useCallback(async () => {
    if (!resumeToDelete) return;
    const target = resumeToDelete;
    try {
      setIsDeleting(true);
      await deleteResume(target.id);
      await fetchVersions(target.id === selectedVersionId ? null : selectedVersionId);
    } catch (error) {
      logger.error("Failed to delete resume", error instanceof Error ? error : undefined);
    } finally {
      setIsDeleting(false);
      setResumeToDelete(null);
    }
  }, [resumeToDelete, selectedVersionId, fetchVersions]);

  const openLatestEditor = useCallback(() => {
    const target = selectedVersionId ?? versions[0]?.id;
    if (target) router.push(`/editor?resumeId=${target}`);
    else startCreateFlow();
  }, [selectedVersionId, versions, router, startCreateFlow]);

  return {
    session,
    router,
    versions,
    selectedVersionId,
    isLoading,
    isCreating,
    fetchVersions,
    handleSelectVersion,
    startCreateFlow,
    openLatestEditor,
    // create modal
    isCreateOpen,
    createTemplate,
    setCreateTemplate,
    createTitle,
    setCreateTitle,
    createError,
    handleConfirmCreate,
    handleCancelCreate,
    // delete modal
    resumeToDelete,
    isDeleting,
    requestDeleteVersion,
    cancelDelete,
    handleDeleteVersion,
  };
}

export type ResumeWorkspace = ReturnType<typeof useResumeWorkspace>;
