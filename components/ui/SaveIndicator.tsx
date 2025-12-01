import React from "react";
import { useCVStore } from "@/store/useCVStore";
import { Cloud, CloudOff, Loader2, Check } from "lucide-react";

export const SaveIndicator: React.FC = () => {
  const { isSaving, hasUnsavedChanges, lastSavedAt, isLoading } = useCVStore();

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-gray-400 text-sm">
        <Loader2 size={16} className="animate-spin" />
        <span>Loading...</span>
      </div>
    );
  }

  if (isSaving) {
    return (
      <div className="flex items-center gap-2 text-blue-500 text-sm">
        <Loader2 size={16} className="animate-spin" />
        <span>Saving...</span>
      </div>
    );
  }

  if (hasUnsavedChanges) {
    return (
      <div className="flex items-center gap-2 text-amber-500 text-sm">
        <CloudOff size={16} />
        <span>Unsaved changes</span>
      </div>
    );
  }

  if (lastSavedAt) {
    const timeAgo = getTimeAgo(lastSavedAt);
    return (
      <div className="flex items-center gap-2 text-green-600 text-sm">
        <Check size={16} />
        <span>Saved {timeAgo}</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-gray-400 text-sm">
      <Cloud size={16} />
      <span>All changes saved</span>
    </div>
  );
};

function getTimeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

  if (seconds < 5) return "just now";
  if (seconds < 60) return `${seconds}s ago`;

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
}
