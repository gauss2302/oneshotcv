"use client";

import { useRouter } from "next/navigation";
import {
  LayoutGrid,
  LayoutTemplate,
  PenLine,
  Target,
  Plus,
  Loader2,
  type LucideIcon,
} from "lucide-react";
import { Bullseye } from "./Bullseye";

interface ResumeVersion {
  id: string;
  title: string;
  updatedAt: string | null;
}

export type BullseyeNav = "dashboard" | "templates" | "editor" | "system";

interface BullseyeSidebarProps {
  active: BullseyeNav;
  versions: ResumeVersion[];
  selectedVersionId: string | null;
  onSelectVersion: (id: string) => void;
  onCreateVersion: () => void;
  isLoading?: boolean;
  isCreating?: boolean;
  userName: string;
  userEmail: string;
  onUpgrade: () => void;
  onNavEditor: () => void;
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "👤";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function NavItem({
  icon: Icon,
  label,
  active = false,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={[
        "flex w-full items-center gap-3 rounded-[9px] px-[13px] py-[9px] text-[14.5px] tracking-[-0.01em] transition-colors",
        active
          ? "bg-[#F1ECE4] font-semibold text-[#1B1815] shadow-[inset_3px_0_0_#DB4B2E]"
          : "font-medium text-[#57514A] hover:bg-[#F1ECE4]",
      ].join(" ")}
    >
      <Icon size={18} strokeWidth={1.6} />
      <span>{label}</span>
    </button>
  );
}

export function BullseyeSidebar({
  active,
  versions,
  selectedVersionId,
  onSelectVersion,
  onCreateVersion,
  isLoading = false,
  isCreating = false,
  userName,
  userEmail,
  onUpgrade,
  onNavEditor,
}: BullseyeSidebarProps) {
  const router = useRouter();

  return (
    <aside className="hidden h-full w-[266px] flex-none flex-col border-r border-[#E7E1D8] bg-[#FCFAF6] px-4 pb-4 pt-[22px] lg:flex">
      {/* Brand */}
      <button
        type="button"
        onClick={() => router.push("/dashboard")}
        className="flex items-center gap-3 px-2 pb-[22px] pt-1 text-left"
      >
        <Bullseye size={32} gap="#FCFAF6" className="shadow-[0_0_0_1px_#E7E1D8]" />
        <div className="leading-none">
          <div className="text-[20px] font-medium tracking-[-0.01em] [font-family:var(--font-spectral)]">
            Bullseye<span className="text-[#DB4B2E]">CV</span>
          </div>
          <div className="mt-1 text-[9.5px] tracking-[0.22em] text-[#A39A8C] [font-family:var(--font-spline-mono)]">
            RESUME&nbsp;OS
          </div>
        </div>
      </button>

      {/* Nav */}
      <nav className="flex flex-col gap-[3px]">
        <NavItem icon={LayoutGrid} label="Dashboard" active={active === "dashboard"} onClick={() => router.push("/dashboard")} />
        <NavItem icon={LayoutTemplate} label="Templates" active={active === "templates"} onClick={() => router.push("/templates")} />
        <NavItem icon={PenLine} label="Editor" active={active === "editor"} onClick={onNavEditor} />
        <NavItem icon={Target} label="Design System" active={active === "system"} onClick={() => router.push("/design-system")} />
      </nav>

      {/* Versions */}
      <div className="mt-[26px] flex items-center justify-between px-[9px]">
        <span className="text-[10px] tracking-[0.16em] text-[#A39A8C] [font-family:var(--font-spline-mono)]">
          MY&nbsp;CV&nbsp;VERSIONS
        </span>
        <button
          type="button"
          onClick={onCreateVersion}
          disabled={isCreating}
          aria-label="New résumé"
          className="flex h-5 w-5 items-center justify-center rounded-md border border-[#E0D9CD] text-[#8C857C] transition-colors hover:border-[#DB4B2E] hover:text-[#DB4B2E] disabled:opacity-60"
        >
          {isCreating ? <Loader2 size={12} className="animate-spin" /> : <Plus size={14} />}
        </button>
      </div>

      <div className="mt-[10px] flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto">
        {isLoading ? (
          [0, 1, 2].map((i) => (
            <div key={i} className="mx-1 my-1 h-3 animate-pulse rounded bg-[#EFE9E0]" />
          ))
        ) : versions.length === 0 ? (
          <p className="px-[9px] py-2 text-[12.5px] text-[#A39A8C]">No versions yet.</p>
        ) : (
          versions.map((v) => {
            const isActive = v.id === selectedVersionId;
            return (
              <button
                key={v.id}
                type="button"
                onClick={() => onSelectVersion(v.id)}
                className={[
                  "flex items-center gap-[10px] rounded-lg px-[9px] py-2 text-left transition-colors",
                  isActive ? "bg-[#F1ECE4]" : "hover:bg-[#F1ECE4]",
                ].join(" ")}
              >
                <span
                  className="h-[7px] w-[7px] flex-none rounded-full"
                  style={{ background: isActive ? "#DB4B2E" : "#C7BDAC" }}
                />
                <span className="truncate text-[13.5px] text-[#3D372F]">{v.title}</span>
              </button>
            );
          })
        )}
      </div>

      {/* Pro + user */}
      <div className="mt-auto flex flex-col gap-[14px] pt-3">
        <div className="rounded-[14px] border border-[#F0D9CF] bg-[linear-gradient(160deg,#FDF1EC,#FBE7DF)] p-4">
          <div className="flex items-center gap-2">
            <Bullseye size={18} gap="#FFFFFF" />
            <span className="text-[10px] tracking-[0.14em] text-[#B83A21] [font-family:var(--font-spline-mono)]">
              ONE&nbsp;SHOT&nbsp;PRO
            </span>
          </div>
          <div className="my-[9px] mb-1 text-[16px] leading-[1.3] text-[#1B1815] [font-family:var(--font-spectral)]">
            Land it in one&nbsp;shot.
          </div>
          <div className="text-[12.5px] leading-[1.45] text-[#8a6256]">
            PDF export, ATS scoring &amp; premium layouts.
          </div>
          <button
            type="button"
            onClick={onUpgrade}
            className="mt-3 w-full rounded-[9px] bg-[#DB4B2E] py-[9px] text-[13px] font-semibold text-white transition-colors hover:bg-[#C03E22]"
          >
            Upgrade
          </button>
        </div>

        <div className="flex items-center gap-[10px] border-t border-[#EFE9E0] px-2 pt-[14px]">
          <div className="flex h-[30px] w-[30px] flex-none items-center justify-center rounded-full bg-[#1B1815] text-[12px] font-semibold text-[#FCFAF6]">
            {initials(userName)}
          </div>
          <div className="min-w-0 flex-1 leading-[1.25]">
            <div className="truncate text-[13px] font-semibold text-[#1B1815]">{userName}</div>
            <div className="truncate text-[11.5px] text-[#A39A8C]">{userEmail}</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
