'use client';

import React, { Suspense } from 'react';
import { CVEditor } from '@/components/CVEditor';
import { CVPreview } from '@/components/CVPreview';
import { FloatingDesignPanel } from '@/components/ui/FloatingDesignPanel';
import { generatePDF } from '@/lib/generatePDF';
import { Download, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useResumeSync } from '@/hooks/use-resume-sync';

function EditorContent() {
  useResumeSync();
  return (
    <main 
      className="min-h-screen flex flex-col"
      style={{
        background: 'radial-gradient(circle, #e5e7eb 1px, transparent 1px)',
        backgroundSize: '24px 24px',
        backgroundColor: '#f3f4f6'
      }}
    >
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-gray-500 hover:text-gray-700 transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-[#FFA239] to-[#FF5656] rounded-lg flex items-center justify-center text-white font-bold text-lg">
              CV
            </div>
            <span className="font-bold text-xl text-gray-800">Builder</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Link 
            href="/dashboard"
            className="flex items-center gap-2 text-gray-600 hover:text-[#FFA239] font-medium transition-colors"
          >
            <div className="p-1.5 bg-gray-100 rounded-md group-hover:bg-[#FFA239]/10">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>
            </div>
            Change Template
          </Link>
          
          <button
            onClick={generatePDF}
            className="flex items-center gap-2 bg-gradient-to-r from-[#FFA239] to-[#FF5656] hover:from-[#FF5656] hover:to-[#FFA239] text-white px-4 py-2 rounded-md font-medium transition-all shadow-sm"
          >
            <Download size={18} />
            Download PDF
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:flex-row relative">
        {/* Editor Panel - Left Side - Scrollable */}
        <div className="w-full lg:w-1/2 xl:w-2/5 border-r border-gray-200 bg-white shadow-xl">
          <CVEditor />
        </div>

        {/* Preview Panel - Right Side - Sticky */}
        <div className="w-full lg:w-1/2 xl:w-3/5 lg:sticky lg:top-[73px] lg:h-[calc(100vh-73px)] overflow-hidden relative">
          <CVPreview />
          
          {/* Floating Design Panel */}
          <FloatingDesignPanel />
        </div>
      </div>
    </main>
  );
}

export default function EditorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading editor...</p>
        </div>
      </div>
    }>
      <EditorContent />
    </Suspense>
  );
}
