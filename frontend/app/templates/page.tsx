"use client";

import { useState } from "react";
import { useResumeWorkspace } from "@/components/dashboard/bullseye/useResumeWorkspace";
import { BullseyeShell } from "@/components/dashboard/bullseye/BullseyeShell";
import { BullseyeTemplateCard } from "@/components/dashboard/bullseye/BullseyeTemplateCard";
import { Bullseye } from "@/components/dashboard/bullseye/Bullseye";
import { TEMPLATE_GALLERY, type TemplateTagTone } from "@/lib/dashboard-templates";

type FilterKey = "all" | TemplateTagTone;

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "ats", label: "ATS-safe" },
  { key: "brand", label: "Expressive" },
  { key: "neutral", label: "Classic" },
];

const count = (tone: TemplateTagTone) =>
  TEMPLATE_GALLERY.filter((t) => t.tone === tone).length;

export default function TemplatesPage() {
  const ws = useResumeWorkspace();
  const [filter, setFilter] = useState<FilterKey>("all");

  const filtered =
    filter === "all" ? TEMPLATE_GALLERY : TEMPLATE_GALLERY.filter((t) => t.tone === filter);

  return (
    <BullseyeShell
      ws={ws}
      active="templates"
      viewTitle="Templates"
      onUpgrade={() => ws.router.push("/dashboard?subscription=required")}
    >
      <div className="mx-auto max-w-[1180px]">
        <div className="text-[11px] tracking-[0.18em] text-[#A39A8C] [font-family:var(--font-spline-mono)]">
          TEMPLATES
        </div>
        <h1 className="mb-2 mt-[10px] text-[34px] font-normal leading-[1.05] tracking-[-0.02em] [font-family:var(--font-spectral)] sm:text-[40px]">
          Choose your starting line.
        </h1>
        <p className="mb-[26px] text-[15.5px] text-[#6B655C]">
          {TEMPLATE_GALLERY.length} layouts, from ATS-safe to expressive. Every one is
          editable.
        </p>

        <div className="mb-7 flex flex-wrap gap-[9px]">
          {FILTERS.map((f) => {
            const active = filter === f.key;
            const n = f.key === "all" ? TEMPLATE_GALLERY.length : count(f.key);
            return (
              <button
                key={f.key}
                type="button"
                onClick={() => setFilter(f.key)}
                className={[
                  "rounded-full px-4 py-2 text-[13px] transition-colors",
                  active
                    ? "bg-[#1B1815] font-semibold text-[#FCFAF6]"
                    : "border border-[#E0D9CD] bg-white font-medium text-[#57514A] hover:border-[#1B1815]",
                ].join(" ")}
              >
                {f.label}
                <span className={active ? "opacity-70" : "text-[#A39A8C]"}> · {n}</span>
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-5">
          <button
            type="button"
            onClick={() => ws.startCreateFlow()}
            className="flex min-h-[300px] flex-col items-center justify-center rounded-[16px] border-[1.5px] border-dashed border-[#C9C0B1] bg-[#FBF8F3] p-6 text-center transition-colors hover:border-[#DB4B2E] hover:bg-[#FDF3EE] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DB4B2E] focus-visible:ring-offset-2 focus-visible:ring-offset-[#EDE7DC]"
          >
            <Bullseye size={52} gap="#FBF8F3" className="mb-4" />
            <div className="text-[18px] text-[#1B1815] [font-family:var(--font-spectral)]">
              Blank résumé
            </div>
            <div className="mt-[5px] max-w-[160px] text-[13px] text-[#A39A8C]">
              Start from a clean, structured layout.
            </div>
          </button>

          {filtered.map((template) => (
            <BullseyeTemplateCard
              key={template.id}
              template={template}
              onSelect={(id, title) => ws.startCreateFlow(id, title)}
            />
          ))}
        </div>
      </div>
    </BullseyeShell>
  );
}
