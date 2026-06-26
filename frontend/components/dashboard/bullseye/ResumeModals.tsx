"use client";

import { TEMPLATE_GALLERY } from "@/lib/dashboard-templates";
import type { ResumeWorkspace } from "./useResumeWorkspace";

export function ResumeModals({ ws }: { ws: ResumeWorkspace }) {
  return (
    <>
      {ws.isCreateOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-[rgba(27,24,21,0.45)] px-4 backdrop-blur-sm">
          <div className="w-full max-w-md space-y-5 rounded-[16px] border border-[#E7E1D8] bg-[#FCFAF6] p-6 shadow-[0_30px_70px_-20px_rgba(27,24,21,0.45)]">
            <div>
              <h3 className="text-[22px] [font-family:var(--font-spectral)]">Create new résumé</h3>
              <p className="text-[13.5px] text-[#6B655C]">Choose a template and give it a name.</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#8C857C]">
                  Name
                </label>
                <input
                  type="text"
                  value={ws.createTitle}
                  onChange={(e) => ws.setCreateTitle(e.target.value)}
                  className="mt-1.5 w-full rounded-[9px] border border-[#E0D9CD] bg-white px-3 py-2.5 text-[14px] text-[#1B1815] outline-none focus:border-[#DB4B2E]"
                  placeholder="e.g. Senior PM — Fintech"
                />
                {ws.createError && (
                  <p className="mt-1 text-[13px] text-[#B83A21]">{ws.createError}</p>
                )}
              </div>

              <div>
                <label className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#8C857C]">
                  Template
                </label>
                <select
                  value={ws.createTemplate}
                  onChange={(e) => ws.setCreateTemplate(e.target.value)}
                  className="mt-1.5 w-full rounded-[9px] border border-[#E0D9CD] bg-white px-3 py-2.5 text-[14px] text-[#1B1815] outline-none focus:border-[#DB4B2E]"
                >
                  {TEMPLATE_GALLERY.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={ws.handleCancelCreate}
                className="rounded-[9px] border border-[#E0D9CD] bg-white px-4 py-2.5 text-[13.5px] font-semibold text-[#3D372F] transition-colors hover:border-[#1B1815]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={ws.handleConfirmCreate}
                className="rounded-[9px] bg-[#DB4B2E] px-5 py-2.5 text-[13.5px] font-semibold text-white transition-colors hover:bg-[#C03E22]"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {ws.resumeToDelete && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-[rgba(27,24,21,0.45)] px-4 backdrop-blur-sm">
          <div className="w-full max-w-md space-y-5 rounded-[16px] border border-[#E7E1D8] bg-[#FCFAF6] p-6 shadow-[0_30px_70px_-20px_rgba(27,24,21,0.45)]">
            <div>
              <h3 className="text-[22px] [font-family:var(--font-spectral)]">Delete résumé</h3>
              <p className="text-[13.5px] text-[#6B655C]">
                Delete{" "}
                <span className="font-semibold text-[#1B1815]">
                  {ws.resumeToDelete.title || "Untitled Résumé"}
                </span>
                ? This can&apos;t be undone.
              </p>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={ws.cancelDelete}
                disabled={ws.isDeleting}
                className="rounded-[9px] border border-[#E0D9CD] bg-white px-4 py-2.5 text-[13.5px] font-semibold text-[#3D372F] transition-colors hover:border-[#1B1815] disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={ws.handleDeleteVersion}
                disabled={ws.isDeleting}
                className="rounded-[9px] bg-[#DB4B2E] px-5 py-2.5 text-[13.5px] font-semibold text-white transition-colors hover:bg-[#C03E22] disabled:opacity-70"
              >
                {ws.isDeleting ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
