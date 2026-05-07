"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Users,
  FileText,
  Settings,
  HelpCircle,
  Plus,
  Loader2,
  Trash2,
  Menu,
  X,
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

interface PrimaryNavItem {
  label: string;
  icon: LucideIcon;
  href: string;
}

const primaryNav: PrimaryNavItem[] = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { label: "My Profile", icon: Users, href: "/profile" },
  { label: "Documents", icon: FileText, href: "/documents" },
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

const SIDEBAR_CONTENT_CLASS =
  "flex flex-col border-r border-gray-200 bg-white w-72 xl:w-80";

function useIsMobile(breakpoint = 1024) {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
    const set = () => setIsMobile(mq.matches);
    set();
    mq.addEventListener("change", set);
    return () => mq.removeEventListener("change", set);
  }, [breakpoint]);
  return isMobile;
}

export function DashboardSidebar({
  versions,
  selectedVersionId,
  onSelectVersion,
  onCreateVersion,
  onDeleteVersion,
  isLoading = false,
  isCreating = false,
}: DashboardSidebarProps) {
  const pathname = usePathname();
  const isMobile = useIsMobile(1024);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const isNavActive = (href: string) => {
    if (!pathname) return false;
    if (pathname === href) return true;
    return pathname.startsWith(`${href}/`);
  };

  const closeDrawer = () => setDrawerOpen(false);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDrawerOpen(false);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [pathname]);

  const sidebarContent = (
    <>
      <div className="px-6 py-8 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#457b9d] to-[#a8dadc] text-white font-bold flex items-center justify-center">
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
            <Link
              href={item.href}
              key={item.label}
              className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition ${
                isNavActive(item.href)
                  ? "bg-gray-100 text-gray-900"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
              aria-current={isNavActive(item.href) ? "page" : undefined}
            >
              <item.icon
                size={18}
                className={
                  isNavActive(item.href) ? "text-[#a8dadc]" : "text-gray-400"
                }
              />
              {item.label}
            </Link>
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
              className="inline-flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:text-[#a8dadc] hover:border-[#a8dadc] transition-all duration-200 h-7 w-7 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
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
                    className={`rounded-2xl border px-4 py-3 transition-all duration-200 ${
                      isActive
                        ? "border-transparent bg-[#457b9d] text-white shadow-md shadow-[#457b9d]/25"
                        : "border-gray-200 hover:border-[#457b9d] hover:shadow-sm"
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
                            : "bg-gray-100 text-gray-500 hover:text-[#a8dadc]"
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
    </>
  );

  if (isMobile) {
    return (
      <>
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          className="lg:hidden fixed top-3 left-4 z-30 flex items-center justify-center w-11 h-11 rounded-xl border border-gray-200 bg-white text-gray-700 shadow-sm hover:bg-gray-50 transition"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>
        {drawerOpen && (
          <>
            <div
              className="fixed inset-0 bg-black/40 z-40 lg:hidden"
              aria-hidden
              onClick={closeDrawer}
            />
            <aside
              className={`${SIDEBAR_CONTENT_CLASS} fixed inset-y-0 left-0 z-50 lg:hidden flex flex-col shadow-xl`}
              role="dialog"
              aria-modal="true"
              aria-label="Dashboard navigation"
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                <span className="text-sm font-semibold text-gray-900">Menu</span>
                <button
                  type="button"
                  onClick={closeDrawer}
                  className="flex items-center justify-center w-10 h-10 rounded-lg text-gray-600 hover:bg-gray-100 transition"
                  aria-label="Close menu"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">
                {sidebarContent}
              </div>
            </aside>
          </>
        )}
      </>
    );
  }

  return (
    <aside className={`hidden lg:flex ${SIDEBAR_CONTENT_CLASS}`}>
      {sidebarContent}
    </aside>
  );
}
