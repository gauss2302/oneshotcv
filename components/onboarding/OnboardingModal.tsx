"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { X } from "lucide-react";
import { logger } from "@/lib/logger";
import { OnboardingStep1 } from "./OnboardingStep1";
import { OnboardingStep2 } from "./OnboardingStep2";
import { OnboardingStep3 } from "./OnboardingStep3";

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: () => void;
  onSkip: () => void;
}

export function OnboardingModal({
  isOpen,
  onComplete,
  onSkip,
}: OnboardingModalProps) {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [isAnimating, setIsAnimating] = useState(false);
  const animationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const persistOnboardingCompletion = useCallback(async () => {
    localStorage.setItem("onboarding_completed", "true");

    try {
      const response = await fetch("/api/user/onboarding/complete", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error(
          `Failed to update onboarding status: ${response.status}`
        );
      }
    } catch (error) {
      logger.error(
        "Failed to update onboarding status",
        error instanceof Error ? error : undefined
      );
      // Continue anyway: localStorage has already been updated.
    }
  }, []);

  const handleComplete = useCallback(async () => {
    await persistOnboardingCompletion();
    onComplete();
  }, [onComplete, persistOnboardingCompletion]);

  const handleSkip = useCallback(async () => {
    await persistOnboardingCompletion();
    onSkip();
  }, [onSkip, persistOnboardingCompletion]);

  const handleNext = useCallback(() => {
    if (currentStep >= 3) {
      void handleComplete();
      return;
    }

    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
    }

    setIsAnimating(true);
    animationTimeoutRef.current = setTimeout(() => {
      setCurrentStep((prev) => (prev + 1) as 1 | 2 | 3);
      setIsAnimating(false);
      animationTimeoutRef.current = null;
    }, 150);
  }, [currentStep, handleComplete]);

  const handlePrevious = useCallback(() => {
    if (currentStep <= 1) {
      return;
    }

    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
    }

    setIsAnimating(true);
    animationTimeoutRef.current = setTimeout(() => {
      setCurrentStep((prev) => (prev - 1) as 1 | 2 | 3);
      setIsAnimating(false);
      animationTimeoutRef.current = null;
    }, 150);
  }, [currentStep]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        void handleSkip();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, handleSkip]);

  useEffect(() => {
    return () => {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
    };
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-lg px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl border border-gray-200 relative overflow-hidden z-[61]">
        {/* Header with Skip button */}
        <div className="flex items-center justify-end p-4 border-b border-gray-200">
          <button
            onClick={handleSkip}
            className="text-sm text-gray-500 hover:text-gray-700 font-medium transition-colors duration-200 px-3 py-1.5 rounded-lg hover:bg-gray-50"
          >
            Skip
          </button>
          <button
            onClick={handleSkip}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-all duration-200 ml-2"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Step Content */}
        <div className="p-8">
          <div
            className={`transition-opacity duration-300 ${
              isAnimating ? "opacity-0" : "opacity-100"
            }`}
          >
            {currentStep === 1 && (
              <OnboardingStep1 onNext={handleNext} />
            )}
            {currentStep === 2 && (
              <OnboardingStep2
                onNext={handleNext}
                onPrevious={handlePrevious}
              />
            )}
            {currentStep === 3 && (
              <OnboardingStep3
                onComplete={handleComplete}
                onPrevious={handlePrevious}
              />
            )}
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="px-8 pb-6 flex items-center justify-center gap-2">
          {[1, 2, 3].map((step) => (
            <div
              key={step}
              className={`h-2 rounded-full transition-all duration-200 ${
                step === currentStep
                  ? "w-8 bg-gradient-to-r from-[#457b9d] to-[#a8dadc]"
                  : step < currentStep
                  ? "w-2 bg-[#457b9d]"
                  : "w-2 bg-gray-300"
              }`}
            />
          ))}
          <span className="ml-3 text-sm text-gray-500 font-medium">
            {currentStep}/3
          </span>
        </div>
      </div>
    </div>
  );
}
