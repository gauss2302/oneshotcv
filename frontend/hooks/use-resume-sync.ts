import { useEffect, useRef, useCallback } from "react";
import { useCVStore } from "@/store/useCVStore";
import { authClient } from "@/lib/auth/auth-client";
import { useSearchParams } from "next/navigation";
import { fetchResume, saveResume } from "@/lib/api/resumes";
import { ApiFetchError } from "@/lib/api/client";
import { logger } from "@/lib/logger";
import type { CVState } from "@/types/cv";
import type { ResumeContent } from "@contracts/resume";

const SAVE_DEBOUNCE_MS = 1500;

function buildResumeContent(state: CVState): ResumeContent {
  return {
    personalInfo: state.personalInfo,
    education: state.education,
    experience: state.experience,
    skills: state.skills,
    selectedTemplate: state.selectedTemplate,
    designSettings: state.designSettings,
  };
}

export function useResumeSync() {
  const { data: session } = authClient.useSession();
  const searchParams = useSearchParams();
  const resumeIdFromUrl = searchParams.get("resumeId");

  const {
    personalInfo,
    education,
    experience,
    skills,
    selectedTemplate,
    designSettings,
    hasUnsavedChanges,
    saveConflict,
    setResume,
    setResumeId,
    setResumeVersion,
    resetStore,
    setIsLoading,
    setIsSaving,
    setSaved,
    setSaveConflict,
    setSaveError,
    clearSaveIssue,
    resumeId: storedResumeId,
  } = useCVStore();

  const isSyncing = useRef(false);
  const lastLoadedResumeId = useRef<string | null>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Track which resumeId the pending changes belong to
  const pendingChangesForResumeId = useRef<string | null>(null);

  // Clear localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("cv-storage");
    }
  }, []);

  // Computed active resume ID
  const activeResumeId = resumeIdFromUrl ?? storedResumeId ?? null;

  // Cancel any pending save
  const cancelPendingSave = useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
    }
    pendingChangesForResumeId.current = null;
  }, []);

  // Load resume data
  useEffect(() => {
    if (!session?.user) return;

    // Skip if we've already loaded this exact resume
    if (lastLoadedResumeId.current === resumeIdFromUrl) {
      return;
    }

    let isCancelled = false;

    const loadResume = async () => {
      // Cancel any pending saves for the previous resume
      cancelPendingSave();

      // Set loading state and reset store when switching
      if (lastLoadedResumeId.current !== null) {
        resetStore();
      } else {
        setIsLoading(true);
      }

      try {
        const data = await fetchResume(resumeIdFromUrl ?? undefined);

        if (isCancelled) return;

        if ("content" in data && data.content) {
          setResume(data.content as Partial<CVState> & { summary?: string });
          setResumeId(data.id);
          setResumeVersion(data.version);
          lastLoadedResumeId.current = data.id;
        } else if (!resumeIdFromUrl) {
          // Create new resume
          const current = useCVStore.getState();
          const createData = await saveResume({
            content: buildResumeContent(current),
            createNew: true,
          });

          if (createData.id) {
            setResumeId(createData.id);
            setResumeVersion(createData.version);
            lastLoadedResumeId.current = createData.id;
          }
        } else {
          logger.warn("Resume not found for id", {
            resumeId: resumeIdFromUrl,
          });
        }
      } catch (error) {
        if (!isCancelled) {
          setSaveError("Unable to load this resume. Please refresh and try again.");
          logger.error(
            "Failed to load resume",
            error instanceof Error ? error : undefined
          );
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    loadResume();

    return () => {
      isCancelled = true;
    };
  }, [
    session,
    resumeIdFromUrl,
    setResume,
    setResumeId,
    setResumeVersion,
    resetStore,
    setIsLoading,
    setSaveError,
    cancelPendingSave,
  ]);

  // Perform the actual save
  const performSave = useCallback(
    async (targetResumeId: string) => {
      if (isSyncing.current) return;

      // Verify we're still on the same resume
      const currentResumeId = useCVStore.getState().resumeId;
      if (currentResumeId !== targetResumeId) {
        return;
      }

      const state = useCVStore.getState();
      if (!state.hasUnsavedChanges) return;

      isSyncing.current = true;
      setIsSaving(true);

      try {
        // Snapshot before the network round-trip so we can detect typing
        // that lands while the request is in flight.
        const versionAtSaveStart = state.mutationCount;

        const savedResume = await saveResume({
          id: targetResumeId,
          version: state.resumeVersion ?? undefined,
          content: buildResumeContent(state),
        });

        const after = useCVStore.getState();
        if (after.resumeId === targetResumeId) {
          setResumeVersion(savedResume.version);
        }

        // Only mark as saved if we're still on this resume AND no new
        // typing landed during the round-trip. Otherwise leave
        // hasUnsavedChanges true so the debounce effect's pending timeout
        // (scheduled by that typing) will fire and persist the latest state.
        if (
          after.resumeId === targetResumeId
          && after.mutationCount === versionAtSaveStart
        ) {
          setSaved();
        }
      } catch (error) {
        if (error instanceof ApiFetchError && error.status === 409) {
          setSaveConflict();
          return;
        }

        setSaveError("Unable to save changes. Please check your connection.");
        logger.error(
          "Failed to save resume",
          error instanceof Error ? error : undefined
        );
      } finally {
        isSyncing.current = false;
        setIsSaving(false);
        pendingChangesForResumeId.current = null;
      }
    },
    [setIsSaving, setResumeVersion, setSaveConflict, setSaveError, setSaved]
  );

  // Debounced save effect - tracks which resume the changes belong to
  useEffect(() => {
    if (!session?.user || !activeResumeId || !hasUnsavedChanges || saveConflict) {
      return;
    }

    // Cancel any existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Mark which resume these changes belong to
    pendingChangesForResumeId.current = activeResumeId;

    // Set new timeout - capture the resumeId at this moment
    const resumeIdToSave = activeResumeId;
    saveTimeoutRef.current = setTimeout(() => {
      performSave(resumeIdToSave);
    }, SAVE_DEBOUNCE_MS);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [
    personalInfo,
    education,
    experience,
    skills,
    designSettings,
    selectedTemplate,
    session,
    activeResumeId,
    hasUnsavedChanges,
    saveConflict,
    performSave,
  ]);

  // Cleanup on unmount - save immediately if needed
  useEffect(() => {
    return () => {
      const state = useCVStore.getState();
      if (
        state.hasUnsavedChanges &&
        state.resumeId &&
        pendingChangesForResumeId.current === state.resumeId
      ) {
        // Synchronous cleanup - can't await here, but we try
        cancelPendingSave();

        // Fire and forget save
        saveResume({
          id: state.resumeId,
          version: state.resumeVersion ?? undefined,
          content: buildResumeContent(state),
        }).catch((error) => {
          if (error instanceof ApiFetchError && error.status === 409) {
            setSaveConflict();
            return;
          }

          setSaveError("Unable to save changes before closing the editor.");
          logger.error(
            "Failed to save resume on cleanup",
            error instanceof Error ? error : undefined
          );
        });
      }
    };
  }, [cancelPendingSave, setSaveConflict, setSaveError]);

  // Imperative "save right now" — used by Cmd/Ctrl+S keyboard shortcut.
  // Cancels any pending debounced save, then awaits the actual write.
  const saveNow = useCallback(async (): Promise<void> => {
    const targetId = useCVStore.getState().resumeId;
    if (!targetId) return;
    cancelPendingSave();
    await performSave(targetId);
  }, [cancelPendingSave, performSave]);

  const reloadRemote = useCallback(async (): Promise<void> => {
    const targetId = useCVStore.getState().resumeId;
    if (!targetId) return;

    cancelPendingSave();
    setIsLoading(true);

    try {
      const data = await fetchResume(targetId);
      if (useCVStore.getState().resumeId !== targetId) {
        return;
      }

      if ("content" in data && data.content) {
        setResume(data.content as Partial<CVState> & { summary?: string });
        setResumeId(data.id);
        setResumeVersion(data.version);
        clearSaveIssue();
        lastLoadedResumeId.current = data.id;
      }
    } catch (error) {
      setSaveError("Unable to reload the latest resume version.");
      logger.error(
        "Failed to reload resume after conflict",
        error instanceof Error ? error : undefined
      );
    } finally {
      setIsLoading(false);
    }
  }, [
    cancelPendingSave,
    clearSaveIssue,
    setIsLoading,
    setResume,
    setResumeId,
    setResumeVersion,
    setSaveError,
  ]);

  const overwriteWithLocal = useCallback(async (): Promise<void> => {
    const state = useCVStore.getState();
    if (!state.resumeId) return;

    cancelPendingSave();
    setIsSaving(true);

    try {
      const targetId = state.resumeId;
      const mutationCountAtStart = state.mutationCount;
      const latest = await fetchResume(targetId);
      if (useCVStore.getState().resumeId !== targetId) {
        return;
      }

      if (!("content" in latest) || !latest.content) {
        setSaveError("Unable to find the latest resume version.");
        return;
      }

      const current = useCVStore.getState();
      const savedResume = await saveResume({
        id: targetId,
        version: latest.version,
        content: buildResumeContent(current),
      });

      const after = useCVStore.getState();
      if (after.resumeId !== targetId) {
        return;
      }

      setResumeVersion(savedResume.version);
      if (after.mutationCount === mutationCountAtStart) {
        setSaved();
      }
      clearSaveIssue();
    } catch (error) {
      if (error instanceof ApiFetchError && error.status === 409) {
        setSaveConflict("The resume changed again before your local copy was saved.");
        return;
      }

      setSaveError("Unable to overwrite with your local changes.");
      logger.error(
        "Failed to overwrite resume after conflict",
        error instanceof Error ? error : undefined
      );
    } finally {
      setIsSaving(false);
    }
  }, [
    cancelPendingSave,
    clearSaveIssue,
    setIsSaving,
    setResumeVersion,
    setSaveConflict,
    setSaveError,
    setSaved,
  ]);

  return { saveNow, reloadRemote, overwriteWithLocal };
}
