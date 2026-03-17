"use client";

import React from "react";
import { Sparkles, Wand2 } from "lucide-react";

interface OnboardingStep2Props {
  onNext: () => void;
  onPrevious: () => void;
}

export function OnboardingStep2({
  onNext,
  onPrevious,
}: OnboardingStep2Props) {
  return (
    <div className="flex flex-col items-center text-center space-y-6">
      {/* Large Icon */}
      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#457b9d] to-[#a8dadc] flex items-center justify-center shadow-lg shadow-[#457b9d]/25">
        <Sparkles size={48} className="text-white" />
      </div>

      {/* Title */}
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">
          Use AI to Improve It
        </h2>
        <p className="text-base text-gray-500 max-w-md">
          Enhance your resume with AI-powered suggestions for better wording,
          formatting, and content optimization. Make your CV stand out to
          recruiters.
        </p>
      </div>

      {/* Visual Example */}
      <div className="w-full max-w-sm bg-gray-50 rounded-xl p-6 border border-gray-200">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-[#457b9d]/10 flex items-center justify-center flex-shrink-0">
            <Wand2 size={20} className="text-[#457b9d]" />
          </div>
          <div className="flex-1 text-left">
            <div className="h-4 bg-[#457b9d]/20 rounded w-full mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-3/4 mb-1"></div>
            <div className="h-3 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
        <div className="space-y-2 pt-2 border-t border-gray-200">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#10b981]"></div>
            <div className="h-3 bg-gray-300 rounded flex-1"></div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#10b981]"></div>
            <div className="h-3 bg-gray-300 rounded flex-1"></div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3">
        <button
          onClick={onPrevious}
          className="px-6 py-3 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 font-medium transition-all duration-200 active:scale-95"
        >
          Previous
        </button>
        <button
          onClick={onNext}
          className="bg-[#457b9d] hover:bg-[#3d6d8a] text-white px-8 py-3 rounded-[16px] font-semibold shadow-[var(--shadow-sm)] hover:shadow-md transition-all duration-200 active:scale-[0.99]"
        >
          Next
        </button>
      </div>
    </div>
  );
}
