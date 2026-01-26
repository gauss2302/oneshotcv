"use client";

import React from "react";
import { FileText, Plus } from "lucide-react";

interface OnboardingStep1Props {
  onNext: () => void;
  onSkip: () => void;
}

export function OnboardingStep1({ onNext, onSkip }: OnboardingStep1Props) {
  return (
    <div className="flex flex-col items-center text-center space-y-6">
      {/* Large Icon */}
      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#FFA239] to-[#FF5656] flex items-center justify-center shadow-lg shadow-[#FFA239]/25">
        <FileText size={48} className="text-white" />
      </div>

      {/* Title */}
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">
          Create CV Quickly
        </h2>
        <p className="text-base text-gray-500 max-w-md">
          Get started in minutes by choosing from our professional templates
          and filling in your information. No design skills required.
        </p>
      </div>

      {/* Visual Example */}
      <div className="w-full max-w-sm bg-gray-50 rounded-xl p-6 border border-gray-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#FFA239] to-[#FF5656] flex items-center justify-center">
            <Plus size={24} className="text-white" />
          </div>
          <div className="flex-1">
            <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
        <div className="space-y-2">
          <div className="h-3 bg-gray-200 rounded w-full"></div>
          <div className="h-3 bg-gray-200 rounded w-5/6"></div>
          <div className="h-3 bg-gray-200 rounded w-4/6"></div>
        </div>
      </div>

      {/* Action Button */}
      <button
        onClick={onNext}
        className="bg-gradient-to-r from-[#FFA239] to-[#FF5656] hover:from-[#FF5656] hover:to-[#FFA239] text-white px-8 py-3 rounded-lg font-semibold shadow-md shadow-[#FFA239]/25 hover:shadow-lg hover:shadow-[#FFA239]/30 transition-all duration-200 active:scale-95"
      >
        Next
      </button>
    </div>
  );
}
