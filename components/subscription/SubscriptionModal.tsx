"use client";

import React, { useState, useEffect } from "react";
import { X, Check, Download, Sparkles } from "lucide-react";
import { logger } from "@/lib/logger";

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  trigger?: "download" | "manual";
}

export function SubscriptionModal({
  isOpen,
  onClose,
  trigger = "manual",
}: SubscriptionModalProps) {
  const [isCreatingCheckout, setIsCreatingCheckout] = useState(false);

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

  if (!isOpen) return null;

  const handleSubscribe = async () => {
    try {
      setIsCreatingCheckout(true);
      const response = await fetch("/api/subscription/checkout", {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to create checkout session");
      }

      const data = await response.json();
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      }
    } catch (error) {
      logger.error(
        "Error creating checkout",
        error instanceof Error ? error : undefined
      );
      alert("Failed to start checkout. Please try again.");
      setIsCreatingCheckout(false);
    }
  };

  const features = [
    "Unlimited PDF downloads",
    "No watermarks",
    "Premium templates",
    "Priority support",
    "Export to multiple formats",
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="relative bg-[#457b9d] p-6 rounded-t-2xl">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
            aria-label="Close"
          >
            <X size={24} />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
              <Sparkles className="text-white" size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">
                Unlock Premium Features
              </h2>
              <p className="text-white/90 text-sm">
                Subscribe to download your resume as PDF
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {trigger === "download" && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Download className="text-amber-600 mt-0.5" size={20} />
                <div>
                  <p className="text-sm font-medium text-amber-900">
                    PDF Download Requires Subscription
                  </p>
                  <p className="text-xs text-amber-700 mt-1">
                    Subscribe now to download your resume as a professional PDF.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Features */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              What you&apos;ll get:
            </h3>
            <ul className="space-y-3">
              {features.map((feature, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="mt-0.5">
                    <Check className="text-green-600" size={20} />
                  </div>
                  <span className="text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Pricing */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-gray-900">$9</span>
              <span className="text-gray-600">/month</span>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Cancel anytime. No hidden fees.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col gap-3">
            <button
              onClick={handleSubscribe}
              disabled={isCreatingCheckout}
              className="w-full bg-[#457b9d] hover:bg-[#3d6d8a] text-white font-semibold py-3 px-6 rounded-[16px] shadow-[var(--shadow-sm)] hover:shadow-md transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed active:scale-[0.99]"
            >
              {isCreatingCheckout ? "Processing..." : "Subscribe Now"}
            </button>
            <button
              onClick={onClose}
              className="w-full text-gray-600 hover:text-gray-800 font-medium py-2 transition-colors"
            >
              Maybe Later
            </button>
          </div>

          {/* Trust indicators */}
          <div className="pt-4 border-t border-gray-200">
            <p className="text-xs text-center text-gray-500">
              Secure payment powered by Polar. Your subscription can be canceled at any time.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
