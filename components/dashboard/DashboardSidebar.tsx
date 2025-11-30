"use client";

import React from "react";
import {
  LayoutDashboard,
  Users,
  FileText,
  Settings,
  HelpCircle,
  Plus,
  Loader2,
  Trash2,
} from "lucide-react";

interface ResumeVersion {
  id: string;
  title: string;
  updatedAt: string | null;
}

interface DashboardSidebarProps {
  versions: ResumeVersion[];
  selectedVersionId: string | null;
  onSelectVersion: (id: string) => void;
  onCreateVersion: () => void;
  onDeleteVersion: (version: ResumeVersion) => void;
  isLoading?: boolean;
  isCreating?: boolean;
}

const primaryNav = [
  { label: "Dashboard", icon: LayoutDashboard },
  { label: "My Profile", icon: Users },
  { label: "Documents", icon: FileText },
];

const secondaryNav = [
  { label: "Settings", icon: Settings },
  { label: "Help & Support", icon: HelpCircle },
];

const formatUpdatedAt = (value: string | null) => {
  if (!value) return "Never edited";
  try {
    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  } catch {
    return value;
  }
};

export function DashboardSidebar({
  versions,
  selectedVersionId,
  onSelectVersion,
  onCreateVersion,
  onDeleteVersion,
  isLoading = false,
  isCreating = false,
}: DashboardSidebarProps) {
  return (
    <aside className="hidden lg:flex w-72 xl:w-80 flex-col border-r border-gray-200 bg-white">
      <div className="px-6 py-8 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FFA239] to-[#FF5656] text-white font-bold flex items-center justify-center">
            CV
          </div>
          <div>
            <p className="text-sm text-gray-500">Resume Workspace</p>
            <p className="text-lg font-semibold text-gray-900">Dashboard</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-8">
        <nav className="space-y-1">
          {primaryNav.map((item) => (
            <button
              key={item.label}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-50 transition"
              type="button"
            >
              <item.icon size={18} className="text-gray-400" />
              {item.label}
            </button>
          ))}
        </nav>

        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs uppercase tracking-wide text-gray-500">
              My CV Versions
            </p>
            <button
              type="button"
              onClick={onCreateVersion}
              disabled={isCreating}
              className="inline-flex items-center justify-center rounded-md border border-gray-200 text-gray-600 hover:text-[#FF5656] hover:border-[#FF5656] transition h-7 w-7 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isCreating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
            </button>
          </div>

          <div className="space-y-2">
            {isLoading && (
              <>
                {[0, 1, 2].map((key) => (
                  <div
                    key={key}
                    className="animate-pulse rounded-xl border border-gray-100 px-3 py-3 bg-gray-50"
                  >
                    <div className="h-3 w-32 bg-gray-200 rounded mb-2" />
                    <div className="h-2 w-24 bg-gray-200 rounded" />
                  </div>
                ))}
              </>
            )}

            {!isLoading && versions.length === 0 && (
              <div className="rounded-xl border border-dashed border-gray-200 px-3 py-4 text-center text-sm text-gray-500">
                No versions yet. Create your first CV.
              </div>
            )}

            {!isLoading &&
              versions.map((version) => {
                const isActive = version.id === selectedVersionId;
                return (
                  <div
                    key={version.id}
                    className={`rounded-2xl border px-4 py-3 transition ${
                      isActive
                        ? "border-transparent bg-gradient-to-r from-[#FFA239] to-[#FF5656] text-white shadow-md"
                        : "border-gray-200 hover:border-[#FFA239]"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onSelectVersion(version.id)}
                        className="flex-1 text-left"
                        type="button"
                      >
                        <p
                          className={`text-sm font-semibold ${
                            isActive ? "text-white" : "text-gray-900"
                          }`}
                        >
                          {version.title || "Untitled Resume"}
                        </p>
                        <p
                          className={`text-xs ${
                            isActive ? "text-white/80" : "text-gray-500"
                          } mt-1`}
                        >
                          {formatUpdatedAt(version.updatedAt)}
                        </p>
                      </button>
                      <button
                        onClick={() => onDeleteVersion(version)}
                        className={`h-8 w-8 rounded-full flex items-center justify-center transition ${
                          isActive
                            ? "bg-white/10 text-white hover:bg-white/20"
                            : "bg-gray-100 text-gray-500 hover:text-[#FF5656]"
                        }`}
                        type="button"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>

      <div className="border-t border-gray-100 px-4 py-6 space-y-2">
        {secondaryNav.map((item) => (
          <button
            key={item.label}
            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-600 rounded-lg hover:bg-gray-50 transition"
            type="button"
          >
            <item.icon size={18} className="text-gray-400" />
            {item.label}
          </button>
        ))}
      </div>
    </aside>
  );
}
