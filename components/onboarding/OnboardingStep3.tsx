"use client";

import React from "react";
import { Download } from "lucide-react";

interface OnboardingStep3Props {
  onComplete: () => void;
  onPrevious: () => void;
  onSkip: () => void;
}

export function OnboardingStep3({
  onComplete,
  onPrevious,
  onSkip,
}: OnboardingStep3Props) {
  return (
    <div className="flex flex-col items-center text-center space-y-6">
      {/* Large Icon */}
      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#FFA239] to-[#FF5656] flex items-center justify-center shadow-lg shadow-[#FFA239]/25">
        <Download size={48} className="text-white" />
      </div>

      {/* Title */}
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">
          Download Resume
        </h2>
        <p className="text-base text-gray-500 max-w-md">
          Export your resume as a professional PDF anytime. Share it with
          employers, upload to job boards, or print it out. Your resume is
          always ready.
        </p>
      </div>

      {/* Visual Example */}
      <div className="w-full max-w-sm bg-gray-50 rounded-xl p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-4 p-3 bg-white rounded-lg border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded bg-gray-200"></div>
            <div className="flex-1 text-left">
              <div className="h-3 bg-gray-300 rounded w-24 mb-2"></div>
              <div className="h-2 bg-gray-200 rounded w-32"></div>
            </div>
          </div>
        </div>
        <button className="w-full bg-gradient-to-r from-[#FFA239] to-[#FF5656] text-white py-3 rounded-lg font-semibold shadow-md shadow-[#FFA239]/25 flex items-center justify-center gap-2">
          <Download size={20} />
          <span>Download PDF</span>
        </button>
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
          onClick={onComplete}
          className="bg-gradient-to-r from-[#FFA239] to-[#FF5656] hover:from-[#FF5656] hover:to-[#FFA239] text-white px-8 py-3 rounded-lg font-semibold shadow-md shadow-[#FFA239]/25 hover:shadow-lg hover:shadow-[#FFA239]/30 transition-all duration-200 active:scale-95"
        >
          Get Started
        </button>
      </div>
    </div>
  );
}
