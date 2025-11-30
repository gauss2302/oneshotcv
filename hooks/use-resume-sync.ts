import { useEffect, useRef } from 'react';
import { useCVStore } from '@/store/useCVStore';
import { authClient } from '@/lib/auth/auth-client';
import { useSearchParams } from 'next/navigation';

export function useResumeSync() {
  const { data: session } = authClient.useSession();
  const searchParams = useSearchParams();
  const resumeId = searchParams.get('resumeId');
  const {
    personalInfo,
    education,
    experience,
    skills,
    selectedTemplate,
    designSettings,
    setResume,
    setResumeId,
    resumeId: storedResumeId
  } = useCVStore();

  const isSyncing = useRef(false);
  const hasLoadedResume = useRef(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('cv-storage');
    }
  }, []);

  useEffect(() => {
    if (!session?.user) return;

    let isCancelled = false;

    const loadResume = async () => {
      hasLoadedResume.current = false;
      try {
        const query = resumeId ? `?id=${resumeId}` : '';
        const res = await fetch(`/api/resume${query}`);
        const data = await res.json();

        if (isCancelled) return;

        if (data.content) {
          setResume(data.content);
          setResumeId(data.id);
        } else if (!resumeId) {
          const current = useCVStore.getState();
          const createRes = await fetch('/api/resume', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              content: {
                personalInfo: current.personalInfo,
                education: current.education,
                experience: current.experience,
                skills: current.skills,
                selectedTemplate: current.selectedTemplate,
                designSettings: current.designSettings,
              },
              createNew: true
            })
          });
          const createData = await createRes.json();
          if (createData.id) {
            setResumeId(createData.id);
          }
        } else {
          console.warn('Resume not found for id:', resumeId);
        }
      } catch (error) {
        if (!isCancelled) {
          console.error(error);
        }
      } finally {
        if (!isCancelled) {
          hasLoadedResume.current = true;
        }
      }
    };

    loadResume();

    return () => {
      isCancelled = true;
    };
  }, [session, resumeId, setResume, setResumeId]);

  const activeResumeId = resumeId ?? storedResumeId ?? undefined;

  useEffect(() => {
    if (!session?.user || !hasLoadedResume.current || !activeResumeId) return;

    const timeoutId = setTimeout(async () => {
      if (isSyncing.current) return;

      isSyncing.current = true;
      try {
        await fetch('/api/resume', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: activeResumeId,
            content: {
              personalInfo,
              education,
              experience,
              skills,
              selectedTemplate,
              designSettings
            }
          })
        });
      } catch (error) {
        console.error('Failed to save resume:', error);
      } finally {
        isSyncing.current = false;
      }
    }, 2000);

    return () => clearTimeout(timeoutId);
  }, [
    personalInfo,
    education,
    experience,
    skills,
    designSettings,
    selectedTemplate,
    session,
    activeResumeId
  ]);
}
