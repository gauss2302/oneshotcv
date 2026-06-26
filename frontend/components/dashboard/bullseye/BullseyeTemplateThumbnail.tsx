// Miniature résumé previews in the BullseyeCV palette (paper / ink / vermillion).
// Each template id maps to one of a few layout archetypes — enough to read the
// structure at thumbnail size, matching the design's abstracted mockups.

const ARCHETYPE: Record<string, string> = {
  "ats-pure": "single",
  "ats-chronological": "single",
  "modern-minimalist": "single",
  minimalist: "single",
  professional: "single",
  compact: "single",
  classic: "centered",
  elegant: "centered",
  academic: "centered",
  "photo-first": "photo",
  timeline: "timeline",
  modern: "sidebar",
  sidebar: "sidebar",
  designer: "sidebar",
  engineer: "skills",
  tech: "skills",
  startup: "skills",
  executive: "exec",
  corporate: "exec",
  bold: "band",
  creative: "band",
};

const INK = "bg-[#1B1815]";
const PAPER = "bg-[#E2DBCF]";
const ACCENT = "bg-[#DB4B2E]";

function Bar({ w, h = "h-[5px]", c = PAPER, className = "" }: { w: string; h?: string; c?: string; className?: string }) {
  return <div className={`${h} ${c} rounded-[3px] ${w} ${className}`} />;
}

function Body({ id }: { id: string }) {
  const arch = ARCHETYPE[id] ?? "single";

  switch (arch) {
    case "centered":
      return (
        <div className="flex h-full flex-col items-center gap-2">
          <Bar w="w-1/2" h="h-[9px]" c={INK} />
          <div className="h-[1.5px] w-[70%] bg-[#DB4B2E]" />
          <Bar w="w-[64%]" h="h-[4px]" />
          <Bar w="w-[90%]" h="h-[4px]" className="mt-1.5" />
          <Bar w="w-[84%]" h="h-[4px]" />
          <Bar w="w-[88%]" h="h-[4px]" />
        </div>
      );
    case "photo":
      return (
        <div className="flex h-full flex-col items-center gap-[7px]">
          <div className="h-[42px] w-[42px] rounded-full border-2 border-[#DB4B2E] bg-[#FBE7DF]" />
          <Bar w="w-[58%]" h="h-[8px]" c={INK} className="mt-0.5" />
          <Bar w="w-[74%]" h="h-[4px]" />
          <div className="mt-1.5 flex gap-1.5">
            <Bar w="w-[26px]" h="h-[6px]" c={ACCENT} />
            <Bar w="w-[26px]" h="h-[6px]" />
            <Bar w="w-[26px]" h="h-[6px]" />
          </div>
        </div>
      );
    case "timeline":
      return (
        <div className="flex h-full gap-[10px]">
          <div className="flex flex-col items-center gap-[5px]">
            <span className="h-[7px] w-[7px] rounded-full bg-[#DB4B2E]" />
            <span className="w-[1.5px] flex-1 bg-[#E2DBCF]" />
            <span className="h-[7px] w-[7px] rounded-full bg-[#DB4B2E]" />
            <span className="w-[1.5px] flex-1 bg-[#E2DBCF]" />
          </div>
          <div className="flex flex-1 flex-col gap-[9px]">
            <div>
              <Bar w="w-[70%]" h="h-[6px]" c={INK} />
              <Bar w="w-[88%]" h="h-[4px]" className="mt-[5px]" />
            </div>
            <div>
              <Bar w="w-[60%]" h="h-[6px]" c={INK} />
              <Bar w="w-[82%]" h="h-[4px]" className="mt-[5px]" />
            </div>
          </div>
        </div>
      );
    case "sidebar":
      return (
        <div className="-m-[15px] flex h-[calc(100%+30px)]">
          <div className="flex w-[38%] flex-col gap-[7px] bg-[#1B1815] px-[10px] py-[14px]">
            <span className="h-6 w-6 rounded-full bg-[#DB4B2E]" />
            <Bar w="w-[80%]" h="h-[4px]" c="bg-[#4A453E]" />
            <Bar w="w-[65%]" h="h-[4px]" c="bg-[#4A453E]" />
            <Bar w="w-[75%]" h="h-[4px]" c="bg-[#4A453E]" />
          </div>
          <div className="flex flex-1 flex-col gap-[7px] px-[12px] py-[14px]">
            <Bar w="w-[75%]" h="h-[7px]" c={INK} />
            <Bar w="w-[90%]" h="h-[4px]" />
            <Bar w="w-[85%]" h="h-[4px]" />
            <Bar w="w-[60%]" h="h-[4px]" />
          </div>
        </div>
      );
    case "skills":
      return (
        <div className="flex h-full flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="h-4 w-4 rounded-[5px] bg-[#DB4B2E]" />
            <Bar w="flex-1" h="h-[9px]" c={INK} />
          </div>
          <div className="mt-1 flex flex-wrap gap-1.5">
            <Bar w="w-[40px]" h="h-[6px]" c="bg-[#FBD8CD]" />
            <Bar w="w-[40px]" h="h-[6px]" c="bg-[#FBD8CD]" />
            <Bar w="w-[40px]" h="h-[6px]" c="bg-[#FBD8CD]" />
          </div>
          <Bar w="w-[90%]" h="h-[4px]" className="mt-1.5" />
          <Bar w="w-[78%]" h="h-[4px]" />
        </div>
      );
    case "exec":
      return (
        <div className="flex h-full flex-col gap-2">
          <div className="flex items-start justify-between">
            <Bar w="w-[48%]" h="h-[10px]" c={INK} />
            <Bar w="w-[24%]" h="h-[6px]" c={ACCENT} />
          </div>
          <Bar w="w-[88%]" h="h-[4px]" className="mt-1" />
          <div className="my-1 h-px w-full bg-[#ECE6DD]" />
          <Bar w="w-[40%]" h="h-[6px]" c={INK} />
          <Bar w="w-[90%]" h="h-[4px]" />
          <Bar w="w-[82%]" h="h-[4px]" />
        </div>
      );
    case "band": {
      const band = id === "bold" ? "bg-[#DB4B2E]" : "bg-[#1B1815]";
      return (
        <div className="-m-[15px] flex h-[calc(100%+30px)] flex-col">
          <div className={`flex flex-col items-center gap-[5px] ${band} px-3 py-[14px]`}>
            <Bar w="w-[60%]" h="h-[7px]" c="bg-white/90" />
            <Bar w="w-[35%]" h="h-[4px]" c="bg-white/50" />
          </div>
          <div className="flex flex-1 flex-col gap-[7px] px-[15px] py-[14px]">
            <Bar w="w-[40%]" h="h-[5px]" c={ACCENT} />
            <Bar w="w-[90%]" h="h-[4px]" />
            <Bar w="w-[84%]" h="h-[4px]" />
            <Bar w="w-[70%]" h="h-[4px]" />
          </div>
        </div>
      );
    }
    default: // single
      return (
        <div className="flex h-full flex-col gap-2">
          <Bar w="w-[58%]" h="h-[9px]" c={INK} />
          <Bar w="w-[90%]" h="h-[5px]" />
          <Bar w="w-[84%]" h="h-[5px]" />
          <Bar w="w-[38%]" h="h-[8px]" c={ACCENT} className="mt-1.5" />
          <Bar w="w-[92%]" h="h-[5px]" />
          <Bar w="w-[80%]" h="h-[5px]" />
        </div>
      );
  }
}

export function BullseyeTemplateThumbnail({ templateId }: { templateId: string }) {
  return (
    <div className="aspect-[3/4] overflow-hidden rounded-t-[6px] border border-b-0 border-[#ECE6DD] bg-white p-[15px]">
      <Body id={templateId} />
    </div>
  );
}
