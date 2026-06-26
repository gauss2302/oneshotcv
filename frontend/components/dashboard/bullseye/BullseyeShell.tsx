"use client";

import type { ReactNode } from "react";
import { bullseyeFontVars } from "@/app/dashboard/fonts";
import { BullseyeSidebar, type BullseyeNav } from "./BullseyeSidebar";
import { BullseyeTopbar } from "./BullseyeTopbar";
import { ResumeModals } from "./ResumeModals";
import type { ResumeWorkspace } from "./useResumeWorkspace";

interface BullseyeShellProps {
  ws: ResumeWorkspace;
  active: BullseyeNav;
  viewTitle: string;
  onUpgrade: () => void;
  children: ReactNode;
}

/**
 * App shell for the BullseyeCV surfaces: warm-paper canvas with the sidebar,
 * topbar and shared résumé modals. Pages provide their scrollable content.
 */
export function BullseyeShell({ ws, active, viewTitle, onUpgrade, children }: BullseyeShellProps) {
  const userName = ws.session?.user?.name || "User";
  const userEmail = ws.session?.user?.email || "";
  const userImage = ws.session?.user?.image ?? null;

  return (
    <div className={`${bullseyeFontVars} text-[#1B1815] [font-family:var(--font-hanken)]`}>
      <div className="flex h-screen w-full overflow-hidden bg-[#EDE7DC]">
        <BullseyeSidebar
          active={active}
          versions={ws.versions}
          selectedVersionId={ws.selectedVersionId}
          onSelectVersion={ws.handleSelectVersion}
          onCreateVersion={() => ws.startCreateFlow()}
          isLoading={ws.isLoading}
          isCreating={ws.isCreating}
          userName={userName}
          userEmail={userEmail}
          onUpgrade={onUpgrade}
          onNavEditor={ws.openLatestEditor}
        />

        <main className="flex min-w-0 flex-1 flex-col">
          <BullseyeTopbar
            viewTitle={viewTitle}
            userName={userName}
            userEmail={userEmail}
            userImage={userImage}
          />
          <div className="flex-1 overflow-y-auto px-5 pb-16 pt-8 sm:px-8 lg:px-[52px] lg:pt-[38px]">
            {children}
          </div>
        </main>
      </div>

      <ResumeModals ws={ws} />
    </div>
  );
}
