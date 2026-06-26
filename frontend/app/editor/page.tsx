'use client';

import React, { Suspense, useMemo, memo, useCallback, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { generatePDF } from '@/lib/generatePDF';
import { AlertTriangle, Download, ArrowLeft, RefreshCw, UploadCloud } from 'lucide-react';
import Link from 'next/link';
import { useResumeSync } from '@/hooks/use-resume-sync';
import { authClient } from '@/lib/auth/auth-client';
import { useCVStore } from '@/store/useCVStore';
import { bullseyeFontVars } from '@/app/dashboard/fonts';
import { Bullseye } from '@/components/dashboard/bullseye/Bullseye';

// Dynamic imports for code splitting and performance
const CVEditor = dynamic(() => import('@/components/CVEditor').then(mod => ({ default: mod.CVEditor })), {
  loading: () => <EditorSkeleton />,
  ssr: false, // Client-side only for better performance
});

const CVPreview = dynamic(() => import('@/components/CVPreview').then(mod => ({ default: mod.CVPreview })), {
  loading: () => <PreviewSkeleton />,
  ssr: false,
});

const FloatingDesignPanel = dynamic(() => import('@/components/ui/FloatingDesignPanel').then(mod => ({ default: mod.FloatingDesignPanel })), {
  ssr: false,
});

const SaveIndicator = dynamic(() => import('@/components/ui/SaveIndicator').then(mod => ({ default: mod.SaveIndicator })), {
  ssr: false,
});

// Loading skeletons
const EditorSkeleton = memo(() => (
  <div className="flex flex-col bg-white border-r border-gray-200 h-full">
    <div className="flex border-b border-gray-200">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex-1 h-14 bg-gray-100 animate-pulse" />
      ))}
    </div>
    <div className="p-6 space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-20 bg-gray-100 rounded animate-pulse" />
      ))}
    </div>
  </div>
));
EditorSkeleton.displayName = 'EditorSkeleton';

const PreviewSkeleton = memo(() => (
  <div className="w-full h-full flex items-center justify-center bg-gray-100">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#DB4B2E] mx-auto mb-4"></div>
      <p className="text-gray-600 font-medium">Loading preview...</p>
    </div>
  </div>
));
PreviewSkeleton.displayName = 'PreviewSkeleton';

// Memoized Navbar component for performance
const EditorNavbar = memo(({ session, isSessionPending }: { session: { user?: { id?: string } } | null; isSessionPending: boolean }) => {
  const handleDownload = useCallback(() => {
    generatePDF();
  }, []);

  return (
    <nav className="sticky top-0 z-20 flex items-center justify-between border-b border-[#E7E1D8] bg-[rgba(252,250,246,0.85)] px-6 py-3.5 backdrop-blur-[8px]">
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard"
          className="text-[#8C857C] transition-colors duration-200 hover:text-[#1B1815]"
          aria-label="Back to dashboard"
          prefetch={true}
        >
          <ArrowLeft size={20} />
        </Link>
        <span className="text-[14px] text-[#C7BDAC]">/</span>
        <div className="flex items-center gap-2.5">
          <Bullseye size={22} gap="#FCFAF6" className="shadow-[0_0_0_1px_#E7E1D8]" />
          <span className="text-[19px] tracking-[-0.01em] text-[#1B1815] [font-family:var(--font-spectral)]">
            Editor
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Save Indicator with real-time updates */}
        {session?.user && !isSessionPending && (
          <div className="hidden sm:block">
            <Suspense fallback={<div className="h-5 w-20 animate-pulse rounded bg-[#EFE9E0]" />}>
              <SaveIndicator />
            </Suspense>
          </div>
        )}

        <Link
          href="/templates"
          className="flex items-center gap-2 text-[13.5px] font-medium text-[#57514A] transition-colors duration-200 hover:text-[#DB4B2E]"
          aria-label="Change template"
          prefetch={true}
        >
          <div className="rounded-md bg-[#F1ECE4] p-1.5">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>
          </div>
          <span className="hidden md:inline">Change template</span>
        </Link>

        <button
          onClick={handleDownload}
          className="flex items-center gap-2 rounded-[9px] bg-[#DB4B2E] px-4 py-2 text-[13.5px] font-semibold text-white transition-all duration-200 hover:bg-[#C03E22] active:scale-95"
          aria-label="Download PDF"
        >
          <Download size={18} />
          <span className="hidden sm:inline">Download</span>
        </button>
      </div>
    </nav>
  );
});
EditorNavbar.displayName = 'EditorNavbar';

// Real-time update indicator component
const RealTimeIndicator = memo(() => {
  const { hasUnsavedChanges, isSaving, saveError, saveConflict } = useCVStore();

  if (!hasUnsavedChanges && !isSaving && !saveError) return null;

  const isIssue = Boolean(saveError);

  return (
    <div className="fixed top-20 right-4 z-30 animate-in slide-in-from-right duration-300">
      <div className={`flex items-center gap-2 px-3 py-2 rounded-lg shadow-lg backdrop-blur-sm ${
        isIssue
          ? 'bg-red-600/90 text-white'
          : isSaving
            ? 'bg-[#1B1815]/90 text-white'
            : 'bg-amber-500/90 text-white'
      }`}>
        <div className={`w-2 h-2 rounded-full ${
          isSaving || saveConflict ? 'bg-white animate-pulse' : 'bg-white'
        }`} />
        <span className="text-xs font-medium">
          {saveConflict ? 'Save conflict' : saveError ? 'Save failed' : isSaving ? 'Saving...' : 'Changes detected'}
        </span>
      </div>
    </div>
  );
});
RealTimeIndicator.displayName = 'RealTimeIndicator';

const SaveIssueBanner = memo(({
  onReload,
  onKeepLocal,
}: {
  onReload: () => void;
  onKeepLocal: () => void;
}) => {
  const { saveError, saveConflict, isSaving, isLoading } = useCVStore();

  if (!saveError) {
    return null;
  }

  return (
    <section className="border-b border-red-200 bg-red-50 px-4 py-3 sm:px-6">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3 text-red-900">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
          <div>
            <p className="text-sm font-semibold">
              {saveConflict ? 'This resume changed elsewhere' : 'Resume could not be saved'}
            </p>
            <p className="mt-0.5 text-sm text-red-700">{saveError}</p>
          </div>
        </div>

        {saveConflict && (
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onReload}
              disabled={isSaving || isLoading}
              className="inline-flex h-9 items-center gap-2 rounded-md border border-red-200 bg-white px-3 text-sm font-medium text-red-800 shadow-sm transition-colors hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
              title="Reload the latest saved version"
            >
              <RefreshCw size={16} />
              <span>Reload latest</span>
            </button>
            <button
              type="button"
              onClick={onKeepLocal}
              disabled={isSaving || isLoading}
              className="inline-flex h-9 items-center gap-2 rounded-md bg-red-600 px-3 text-sm font-medium text-white shadow-sm transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              title="Overwrite the saved version with this local copy"
            >
              <UploadCloud size={16} />
              <span>Keep local</span>
            </button>
          </div>
        )}
      </div>
    </section>
  );
});
SaveIssueBanner.displayName = 'SaveIssueBanner';

function EditorContent() {
  const { data: session, isPending: isSessionPending } = authClient.useSession();
  const { saveNow, reloadRemote, overwriteWithLocal } = useResumeSync();

  // Keyboard shortcuts:
  //   Cmd/Ctrl+S → flush any debounced changes and save immediately
  //   Cmd/Ctrl+D → trigger PDF download (overrides browser bookmark dialog)
  // Both also work as Ctrl on non-mac, hence the (metaKey || ctrlKey) guard.
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!(e.metaKey || e.ctrlKey)) return;
      const key = e.key.toLowerCase();
      if (key === "s") {
        e.preventDefault();
        void saveNow();
        return;
      }
      if (key === "d") {
        e.preventDefault();
        void generatePDF();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [saveNow]);

  // Memoize background style to prevent re-renders
  const backgroundStyle = useMemo(() => ({
    background: 'radial-gradient(circle, #DDD3C4 1px, transparent 1px)',
    backgroundSize: '24px 24px',
    backgroundColor: '#EDE7DC'
  }), []);

  // Show loading state while session is being checked
  if (isSessionPending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#EDE7DC]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#DB4B2E] mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Verifying session...</p>
        </div>
      </div>
    );
  }

  // If no session after loading, show message (though middleware should redirect)
  if (!session?.user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#EDE7DC]">
        <div className="text-center max-w-md px-4">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Authentication Required</h2>
          <p className="text-gray-600 mb-6">Please sign in to access the editor.</p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 bg-[#DB4B2E] hover:bg-[#C03E22] text-white px-6 py-3 rounded-[9px] font-semibold transition-all duration-200 shadow-sm hover:shadow-md"
            prefetch={true}
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main
      className={`${bullseyeFontVars} flex min-h-screen flex-col text-[#1B1815] [font-family:var(--font-hanken)]`}
      style={backgroundStyle}
    >
      {/* Navbar */}
      <EditorNavbar session={session} isSessionPending={isSessionPending} />

      <SaveIssueBanner
        onReload={() => {
          void reloadRemote();
        }}
        onKeepLocal={() => {
          void overwriteWithLocal();
        }}
      />

      {/* Real-time update indicator */}
      <RealTimeIndicator />

      {/* Main Content with Suspense boundaries for granular loading */}
      <div className="flex-1 flex flex-col lg:flex-row relative">
        {/* Editor Panel - Left Side - Scrollable */}
        <div className="w-full lg:w-1/2 xl:w-2/5 border-r border-gray-200 bg-white shadow-xl">
          <Suspense fallback={<EditorSkeleton />}>
            <CVEditor />
          </Suspense>
        </div>

        {/* Preview Panel - Right Side - Sticky */}
        <div className="w-full lg:w-1/2 xl:w-3/5 lg:sticky lg:top-[73px] lg:h-[calc(100vh-73px)] overflow-hidden relative">
          <Suspense fallback={<PreviewSkeleton />}>
            <CVPreview />
          </Suspense>
          
          {/* Floating Design Panel */}
          <Suspense fallback={null}>
            <FloatingDesignPanel />
          </Suspense>
        </div>
      </div>
    </main>
  );
}

export default function EditorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#EDE7DC]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#DB4B2E] mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading editor...</p>
        </div>
      </div>
    }>
      <EditorContent />
    </Suspense>
  );
}
