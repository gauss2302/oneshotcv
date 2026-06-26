"use client";

import { useResumeWorkspace } from "@/components/dashboard/bullseye/useResumeWorkspace";
import { BullseyeShell } from "@/components/dashboard/bullseye/BullseyeShell";
import { Bullseye } from "@/components/dashboard/bullseye/Bullseye";

const SWATCHES: { name: string; hex: string; note: string; ring?: boolean }[] = [
  { name: "Vermillion", hex: "#DB4B2E", note: "accent" },
  { name: "Vermillion 700", hex: "#B83A21", note: "hover" },
  { name: "Vermillion 50", hex: "#FBEAE4", note: "tint", ring: true },
  { name: "Ink", hex: "#1B1815", note: "text" },
  { name: "Ink Soft", hex: "#57514A", note: "2nd" },
  { name: "Paper", hex: "#EDE7DC", note: "bg", ring: true },
  { name: "Surface", hex: "#FFFFFF", note: "card", ring: true },
  { name: "Forest", hex: "#3A7A5E", note: "success" },
];

const MONO = "[font-family:var(--font-spline-mono)]";
const SERIF = "[font-family:var(--font-spectral)]";

function Card({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-6 rounded-[16px] border border-[#E7E1D8] bg-white p-[28px_30px] shadow-[0_1px_2px_rgba(27,24,21,0.05),0_14px_32px_-20px_rgba(27,24,21,0.18)]">
      <div className={`mb-5 text-[11px] tracking-[0.16em] text-[#A39A8C] ${MONO}`}>{label}</div>
      {children}
    </div>
  );
}

export default function DesignSystemPage() {
  const ws = useResumeWorkspace();

  return (
    <BullseyeShell
      ws={ws}
      active="system"
      viewTitle="Design System"
      onUpgrade={() => ws.router.push("/dashboard?subscription=required")}
    >
      <div className="mx-auto max-w-[1080px]">
        <div className={`text-[11px] tracking-[0.18em] text-[#A39A8C] ${MONO}`}>FOUNDATIONS</div>
        <h1 className={`mb-2 mt-[10px] text-[34px] font-normal leading-[1.05] tracking-[-0.02em] ${SERIF} sm:text-[42px]`}>
          The BullseyeCV system.
        </h1>
        <p className="mb-9 max-w-[600px] text-[15.5px] text-[#6B655C]">
          Warm paper, confident ink, one decisive accent — the center of the target. Built to
          feel like a precise, trustworthy tool.
        </p>

        {/* Brand */}
        <div className="mb-6 flex flex-wrap items-center gap-[34px] rounded-[16px] border border-[#E7E1D8] bg-white p-[30px] shadow-[0_1px_2px_rgba(27,24,21,0.05),0_14px_32px_-20px_rgba(27,24,21,0.18)]">
          <Bullseye
            size={120}
            gap="#FFFFFF"
            className="shadow-[0_0_0_1px_#E7E1D8,0_14px_30px_-16px_rgba(219,75,46,0.5)]"
          />
          <div className="min-w-[240px] flex-1">
            <div className={`text-[34px] font-medium tracking-[-0.01em] ${SERIF}`}>
              Bullseye<span className="text-[#DB4B2E]">CV</span>
            </div>
            <div className={`my-[8px] mb-[14px] text-[11px] tracking-[0.2em] text-[#A39A8C] ${MONO}`}>
              AIM&nbsp;·&nbsp;TAILOR&nbsp;·&nbsp;FIRE
            </div>
            <p className="m-0 max-w-[440px] text-[14.5px] leading-[1.55] text-[#57514A]">
              The mark is a target — concentric rings narrowing to a single red center. It signals
              precision and the product promise: land the role in one shot.
            </p>
          </div>
        </div>

        {/* Color */}
        <Card label="COLOR">
          <div className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-4">
            {SWATCHES.map((s) => (
              <div key={s.name}>
                <div
                  className="h-[74px] rounded-[11px]"
                  style={{
                    background: s.hex,
                    boxShadow: s.ring
                      ? "inset 0 0 0 1px #E7E1D8"
                      : "inset 0 0 0 1px rgba(0,0,0,.04)",
                  }}
                />
                <div className="mt-[9px] text-[13px] font-semibold">{s.name}</div>
                <div className={`text-[11px] text-[#A39A8C] ${MONO}`}>
                  {s.hex} · {s.note}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Type */}
        <Card label="TYPE">
          <div className="flex flex-col gap-5">
            {[
              { tag: "Spectral · Display", el: <span className={`text-[38px] font-normal tracking-[-0.02em] ${SERIF}`}>Aim your next role</span> },
              { tag: "Spectral · Heading", el: <span className={`text-[24px] font-medium ${SERIF}`}>My CV versions</span> },
              {
                tag: "Hanken · Body",
                el: (
                  <span className="max-w-[480px] text-[16px] text-[#33302B]">
                    A clean grotesk carries every label, field and paragraph — legible at small
                    sizes and quiet enough to let the serif lead.
                  </span>
                ),
              },
              {
                tag: "Spline Mono · Label",
                el: (
                  <span className={`text-[12px] tracking-[0.16em] text-[#57514A] ${MONO}`}>
                    ATS&nbsp;MATCH&nbsp;·&nbsp;WORKSPACE&nbsp;·&nbsp;92%
                  </span>
                ),
              },
            ].map((row, i, arr) => (
              <div
                key={row.tag}
                className={`flex flex-wrap items-baseline gap-6 ${i < arr.length - 1 ? "border-b border-[#F0EAE1] pb-[18px]" : ""}`}
              >
                <span className={`w-[140px] flex-none text-[11px] text-[#A39A8C] ${MONO}`}>
                  {row.tag}
                </span>
                {row.el}
              </div>
            ))}
          </div>
        </Card>

        {/* Components */}
        <Card label="COMPONENTS">
          <div className="mb-[11px] text-[12.5px] font-semibold text-[#8C857C]">Buttons</div>
          <div className="mb-[26px] flex flex-wrap items-center gap-3">
            <button className="rounded-[10px] bg-[#DB4B2E] px-[18px] py-[11px] text-[14px] font-semibold text-white transition-colors hover:bg-[#C03E22]">
              Primary
            </button>
            <button className="rounded-[10px] bg-[#1B1815] px-[18px] py-[11px] text-[14px] font-semibold text-[#FCFAF6] transition-colors hover:bg-[#332e28]">
              Ink
            </button>
            <button className="rounded-[10px] border border-[#E0D9CD] bg-white px-[18px] py-[11px] text-[14px] font-semibold text-[#3D372F] transition-colors hover:border-[#1B1815]">
              Secondary
            </button>
            <button className="rounded-[10px] px-[14px] py-[11px] text-[14px] font-semibold text-[#DB4B2E]">
              Ghost →
            </button>
          </div>

          <div className="mb-[11px] text-[12.5px] font-semibold text-[#8C857C]">Tags &amp; status</div>
          <div className="mb-[26px] flex flex-wrap items-center gap-[9px]">
            <span className={`rounded-full bg-[#E7F1EB] px-[9px] py-1 text-[10px] uppercase tracking-[0.04em] text-[#2F6B4F] ${MONO}`}>ATS safe</span>
            <span className={`rounded-full bg-[#FBEAE4] px-[9px] py-1 text-[10px] uppercase tracking-[0.04em] text-[#B83A21] ${MONO}`}>Brand</span>
            <span className={`rounded-full bg-[#F1ECE4] px-[9px] py-1 text-[10px] uppercase tracking-[0.04em] text-[#6B655C] ${MONO}`}>Neutral</span>
            <span className={`rounded-full bg-[#FCF1DE] px-[9px] py-1 text-[10px] uppercase tracking-[0.04em] text-[#B5781F] ${MONO}`}>Draft</span>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <div className="mb-[11px] text-[12.5px] font-semibold text-[#8C857C]">Input</div>
              <label className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#8C857C]">Role</label>
              <input
                defaultValue="Senior Product Manager"
                className="mt-1.5 w-full rounded-[9px] border border-[#E0D9CD] bg-white px-3 py-2.5 text-[14px] text-[#1B1815] outline-none focus:border-[#DB4B2E]"
              />
            </div>
            <div>
              <div className="mb-[11px] text-[12.5px] font-semibold text-[#8C857C]">Alert</div>
              <div className="flex gap-2.5 rounded-[11px] border border-[#EBD9B8] bg-[#FCF6E8] px-3.5 py-3">
                <svg width="17" height="17" viewBox="0 0 18 18" fill="none" className="mt-px flex-none">
                  <circle cx="9" cy="9" r="7.3" stroke="#B5781F" strokeWidth="1.5" />
                  <path d="M9 5.2v4.4" stroke="#B5781F" strokeWidth="1.6" strokeLinecap="round" />
                  <circle cx="9" cy="12.4" r="0.9" fill="#B5781F" />
                </svg>
                <div className="text-[12.5px] leading-[1.45] text-[#8a7335]">
                  <b className="text-[#5C4A1E]">Free plan.</b> Subscribe to unlock PDF export.
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </BullseyeShell>
  );
}
