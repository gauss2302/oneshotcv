import { useEffect, useRef, useCallback } from "react";
import { useCVStore } from "@/store/useCVStore";
import { authClient } from "@/lib/auth/auth-client";
import { useSearchParams } from "next/navigation";

const SAVE_DEBOUNCE_MS = 1500;

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
    setResume,
    setResumeId,
    resetStore,
    setIsLoading,
    setIsSaving,
    setSaved,
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
        const query = resumeIdFromUrl ? `?id=${resumeIdFromUrl}` : "";
        const res = await fetch(`/api/resume${query}`);
        const data = await res.json();

        if (isCancelled) return;

        if (data.content) {
          setResume(data.content);
          setResumeId(data.id);
          lastLoadedResumeId.current = data.id;
        } else if (!resumeIdFromUrl) {
          // Create new resume
          const current = useCVStore.getState();
          const createRes = await fetch("/api/resume", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              content: {
                personalInfo: { ...current.personalInfo, photo: undefined },
                education: current.education,
                experience: current.experience,
                skills: current.skills,
                selectedTemplate: current.selectedTemplate,
                designSettings: current.designSettings,
              },
              createNew: true,
            }),
          });
          const createData = await createRes.json();
          if (createData.id) {
            setResumeId(createData.id);
            lastLoadedResumeId.current = createData.id;
          }
        } else {
          console.warn("Resume not found for id:", resumeIdFromUrl);
        }
      } catch (error) {
        if (!isCancelled) {
          console.error("Failed to load resume:", error);
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
    resetStore,
    setIsLoading,
    cancelPendingSave,
  ]);

  // Perform the actual save
  const performSave = useCallback(
    async (targetResumeId: string) => {
      if (isSyncing.current) return;

      // Verify we're still on the same resume
      const currentResumeId = useCVStore.getState().resumeId;
      if (currentResumeId !== targetResumeId) {
        console.log("Skipping save - resume changed", {
          targetResumeId,
          currentResumeId,
        });
        return;
      }

      const state = useCVStore.getState();
      if (!state.hasUnsavedChanges) return;

      isSyncing.current = true;
      setIsSaving(true);

      try {
        const { photo, ...personalInfoWithoutPhoto } = state.personalInfo;

        const response = await fetch("/api/resume", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: targetResumeId,
            content: {
              personalInfo: personalInfoWithoutPhoto,
              education: state.education,
              experience: state.experience,
              skills: state.skills,
              selectedTemplate: state.selectedTemplate,
              designSettings: state.designSettings,
            },
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to save");
        }

        // Only mark as saved if we're still on the same resume
        if (useCVStore.getState().resumeId === targetResumeId) {
          setSaved();
        }
      } catch (error) {
        console.error("Failed to save resume:", error);
      } finally {
        isSyncing.current = false;
        setIsSaving(false);
        pendingChangesForResumeId.current = null;
      }
    },
    [setIsSaving, setSaved]
  );

  // Debounced save effect - tracks which resume the changes belong to
  useEffect(() => {
    if (!session?.user || !activeResumeId || !hasUnsavedChanges) return;

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
        const { photo, ...personalInfoWithoutPhoto } = state.personalInfo;
        fetch("/api/resume", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: state.resumeId,
            content: {
              personalInfo: personalInfoWithoutPhoto,
              education: state.education,
              experience: state.experience,
              skills: state.skills,
              selectedTemplate: state.selectedTemplate,
              designSettings: state.designSettings,
            },
          }),
        }).catch(console.error);
      }
    };
  }, [cancelPendingSave]);
}
