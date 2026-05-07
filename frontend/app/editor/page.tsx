'use client';

import React, { Suspense, useMemo, memo, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { generatePDF } from '@/lib/generatePDF';
import { Download, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useResumeSync } from '@/hooks/use-resume-sync';
import { authClient } from '@/lib/auth/auth-client';
import { useCVStore } from '@/store/useCVStore';

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
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#457b9d] mx-auto mb-4"></div>
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
    <nav className="border-b border-gray-200 px-6 py-4 flex justify-between items-center sticky top-0 z-20 shadow-sm backdrop-blur-sm bg-white/95">
      <div className="flex items-center gap-4">
        <Link 
          href="/dashboard" 
          className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
          aria-label="Back to dashboard"
          prefetch={true}
        >
          <ArrowLeft size={20} />
        </Link>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-[#457b9d] to-[#a8dadc] rounded-lg flex items-center justify-center text-white font-bold text-lg">
            CV
          </div>
          <span className="font-bold text-xl text-gray-800">Builder</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Save Indicator with real-time updates */}
        {session?.user && !isSessionPending && (
          <div className="hidden sm:block">
            <Suspense fallback={<div className="h-5 w-20 bg-gray-100 rounded animate-pulse" />}>
              <SaveIndicator />
            </Suspense>
          </div>
        )}
        
        <Link 
          href="/dashboard"
          className="flex items-center gap-2 text-gray-600 hover:text-[#457b9d] font-medium transition-colors duration-200"
          aria-label="Change template"
          prefetch={true}
        >
          <div className="p-1.5 bg-gray-100 rounded-md group-hover:bg-[#457b9d]/10 transition-colors duration-200">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>
          </div>
          <span className="hidden md:inline">Change Template</span>
        </Link>
        
        <button
          onClick={handleDownload}
          className="flex items-center gap-2 bg-gradient-to-r bg-[#457b9d] hover:bg-[#3d6d8a] text-white px-4 py-2 rounded-md font-medium transition-all duration-200 shadow-sm hover:shadow-md active:scale-95"
          aria-label="Download PDF"
        >
          <Download size={18} />
          <span className="hidden sm:inline">Download PDF</span>
        </button>
      </div>
    </nav>
  );
});
EditorNavbar.displayName = 'EditorNavbar';

// Real-time update indicator component
const RealTimeIndicator = memo(() => {
  const { hasUnsavedChanges, isSaving } = useCVStore();
  
  if (!hasUnsavedChanges && !isSaving) return null;

  return (
    <div className="fixed top-20 right-4 z-30 animate-in slide-in-from-right duration-300">
      <div className={`flex items-center gap-2 px-3 py-2 rounded-lg shadow-lg backdrop-blur-sm ${
        isSaving 
          ? 'bg-blue-500/90 text-white' 
          : 'bg-amber-500/90 text-white'
      }`}>
        <div className={`w-2 h-2 rounded-full ${
          isSaving ? 'bg-white animate-pulse' : 'bg-white'
        }`} />
        <span className="text-xs font-medium">
          {isSaving ? 'Saving...' : 'Changes detected'}
        </span>
      </div>
    </div>
  );
});
RealTimeIndicator.displayName = 'RealTimeIndicator';

function EditorContent() {
  const { data: session, isPending: isSessionPending } = authClient.useSession();
  useResumeSync();

  // Memoize background style to prevent re-renders
  const backgroundStyle = useMemo(() => ({
    background: 'radial-gradient(circle, #e5e7eb 1px, transparent 1px)',
    backgroundSize: '24px 24px',
    backgroundColor: '#f3f4f6'
  }), []);

  // Show loading state while session is being checked
  if (isSessionPending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#457b9d] mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Verifying session...</p>
        </div>
      </div>
    );
  }

  // If no session after loading, show message (though middleware should redirect)
  if (!session?.user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
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
            className="inline-flex items-center gap-2 bg-gradient-to-r bg-[#457b9d] hover:bg-[#3d6d8a] text-white px-6 py-3 rounded-md font-medium transition-all duration-200 shadow-sm hover:shadow-md"
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
      className="min-h-screen flex flex-col"
      style={backgroundStyle}
    >
      {/* Navbar */}
      <EditorNavbar session={session} isSessionPending={isSessionPending} />

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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#457b9d] mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading editor...</p>
        </div>
      </div>
    }>
      <EditorContent />
    </Suspense>
  );
}
