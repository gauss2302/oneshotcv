import { BullseyeTemplateThumbnail } from "./BullseyeTemplateThumbnail";
import type { TemplateGalleryItem, TemplateTagTone } from "@/lib/dashboard-templates";

const TONE: Record<TemplateTagTone, string> = {
  ats: "bg-[#E7F1EB] text-[#2F6B4F]",
  brand: "bg-[#FBEAE4] text-[#B83A21]",
  neutral: "bg-[#F1ECE4] text-[#6B655C]",
};

export function BullseyeTemplateCard({
  template,
  onSelect,
}: {
  template: TemplateGalleryItem;
  onSelect: (id: string, title: string) => void;
}) {
  const { id, name, tag, tone } = template;
  return (
    <button
      type="button"
      onClick={() => onSelect(id, `${name} Résumé`)}
      className="group block overflow-hidden rounded-[16px] border border-[#E7E1D8] bg-white text-left shadow-[0_1px_2px_rgba(27,24,21,0.05),0_14px_32px_-20px_rgba(27,24,21,0.18)] transition-all duration-200 hover:-translate-y-[3px] hover:shadow-[0_18px_36px_-18px_rgba(27,24,21,0.24)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DB4B2E] focus-visible:ring-offset-2 focus-visible:ring-offset-[#EDE7DC]"
    >
      <div className="bg-[linear-gradient(180deg,#F7F2EA,#FCFAF6)] px-[18px] pt-[18px]">
        <BullseyeTemplateThumbnail templateId={id} />
      </div>
      <div className="flex items-center justify-between border-t border-[#F0EAE1] px-4 py-[14px]">
        <span className="text-[15.5px] text-[#1B1815] [font-family:var(--font-spectral)]">{name}</span>
        <span
          className={`rounded-full px-2 py-[3px] text-[10px] uppercase tracking-[0.04em] [font-family:var(--font-spline-mono)] ${TONE[tone]}`}
        >
          {tag}
        </span>
      </div>
    </button>
  );
}
