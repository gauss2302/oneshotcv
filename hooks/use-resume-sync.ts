import { useEffect, useRef, useCallback } from "react";
import { useCVStore } from "@/store/useCVStore";
import { authClient } from "@/lib/auth/auth-client";
import { useSearchParams } from "next/navigation";

const SAVE_DEBOUNCE_MS = 1500;

export function useResumeSync() {
  const { data: session } = authClient.useSession();
  const searchParams = useSearchParams();
  const resumeId = searchParams.get("resumeId");

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

  // Clear localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("cv-storage");
    }
  }, []);

  // Load resume data
  useEffect(() => {
    if (!session?.user) return;

    // Skip if we've already loaded this exact resume
    if (lastLoadedResumeId.current === resumeId) {
      return;
    }

    let isCancelled = false;

    const loadResume = async () => {
      // Set loading state and reset store when switching
      if (lastLoadedResumeId.current !== null) {
        resetStore();
      } else {
        setIsLoading(true);
      }

      try {
        const query = resumeId ? `?id=${resumeId}` : "";
        const res = await fetch(`/api/resume${query}`);
        const data = await res.json();

        if (isCancelled) return;

        if (data.content) {
          setResume(data.content);
          setResumeId(data.id);
          lastLoadedResumeId.current = data.id;
        } else if (!resumeId) {
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
          console.warn("Resume not found for id:", resumeId);
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
  }, [session, resumeId, setResume, setResumeId, resetStore, setIsLoading]);

  // Auto-save with debounce
  const activeResumeId = resumeId ?? storedResumeId ?? undefined;

  const saveResume = useCallback(async () => {
    if (!activeResumeId || isSyncing.current) return;

    const state = useCVStore.getState();
    if (!state.hasUnsavedChanges) return;

    isSyncing.current = true;
    setIsSaving(true);

    try {
      const { photo, ...personalInfoWithoutPhoto } = state.personalInfo;

      await fetch("/api/resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: activeResumeId,
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

      setSaved();
    } catch (error) {
      console.error("Failed to save resume:", error);
    } finally {
      isSyncing.current = false;
      setIsSaving(false);
    }
  }, [activeResumeId, setIsSaving, setSaved]);

  // Debounced save effect
  useEffect(() => {
    if (!session?.user || !activeResumeId || !hasUnsavedChanges) return;

    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Set new timeout
    saveTimeoutRef.current = setTimeout(() => {
      saveResume();
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
    saveResume,
  ]);

  // Save on unmount if there are unsaved changes
  useEffect(() => {
    return () => {
      if (useCVStore.getState().hasUnsavedChanges && activeResumeId) {
        saveResume();
      }
    };
  }, [activeResumeId, saveResume]);
}
