import React, { memo, useEffect, useMemo, useState } from "react";
import { useCVStore } from "@/store/useCVStore";
import { Cloud, CloudOff, Loader2, Check } from "lucide-react";

export const SaveIndicator: React.FC = memo(() => {
  const { isSaving, hasUnsavedChanges, lastSavedAt, isLoading } = useCVStore();
  const [now, setNow] = useState(() => Date.now());

  // Re-render once per second while we have a timestamp to display.
  useEffect(() => {
    if (!lastSavedAt) {
      return;
    }

    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, [lastSavedAt]);

  const timeAgo = useMemo(() => {
    if (!lastSavedAt) {
      return "";
    }
    return getTimeAgo(lastSavedAt, now);
  }, [lastSavedAt, now]);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-gray-400 text-sm animate-in fade-in duration-200">
        <Loader2 size={16} className="animate-spin" />
        <span>Loading...</span>
      </div>
    );
  }

  if (isSaving) {
    return (
      <div className="flex items-center gap-2 text-blue-500 text-sm animate-in fade-in duration-200">
        <Loader2 size={16} className="animate-spin" />
        <span className="font-medium">Saving...</span>
      </div>
    );
  }

  if (hasUnsavedChanges) {
    return (
      <div className="flex items-center gap-2 text-amber-500 text-sm animate-in fade-in duration-200">
        <CloudOff size={16} className="animate-pulse" />
        <span className="font-medium">Unsaved changes</span>
      </div>
    );
  }

  if (lastSavedAt && timeAgo) {
    return (
      <div className="flex items-center gap-2 text-green-600 text-sm animate-in fade-in duration-200">
        <Check size={16} className="text-green-600" />
        <span className="font-medium">Saved {timeAgo}</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-gray-400 text-sm animate-in fade-in duration-200">
      <Cloud size={16} />
      <span>All changes saved</span>
    </div>
  );
});
SaveIndicator.displayName = 'SaveIndicator';

function getTimeAgo(date: Date, now: number): string {
  const seconds = Math.floor((now - date.getTime()) / 1000);

  if (seconds < 5) return "just now";
  if (seconds < 60) return `${seconds}s ago`;

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
