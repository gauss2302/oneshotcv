import { useSearchParams } from 'next/navigation';

/**
 * Hook to get the current resume ID from URL parameters
 * Returns the resume ID if present, or null if not found
 */
export function useResumeId(): string | null {
  const searchParams = useSearchParams();
  return searchParams.get('resumeId');
}
