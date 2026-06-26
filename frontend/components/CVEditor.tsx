import React, { useState, useMemo, useCallback, memo } from "react";
import dynamic from "next/dynamic";
import { EditorSkeleton } from "./ui/EditorSkeleton";
import { useCVStore } from "@/store/useCVStore";
import { User, GraduationCap, Briefcase, Wrench } from "lucide-react";
import clsx from "clsx";

// Dynamic imports for form components to improve initial load
const PersonalForm = dynamic(() => import("./forms/PersonalForm").then(mod => ({ default: mod.PersonalForm })), {
  loading: () => <div className="h-64 bg-gray-100 animate-pulse rounded" />,
});

const EducationForm = dynamic(() => import("./forms/EducationForm").then(mod => ({ default: mod.EducationForm })), {
  loading: () => <div className="h-64 bg-gray-100 animate-pulse rounded" />,
});

const ExperienceForm = dynamic(() => import("./forms/ExperienceForm").then(mod => ({ default: mod.ExperienceForm })), {
  loading: () => <div className="h-64 bg-gray-100 animate-pulse rounded" />,
});

const SkillsForm = dynamic(() => import("./forms/SkillsForm").then(mod => ({ default: mod.SkillsForm })), {
  loading: () => <div className="h-64 bg-gray-100 animate-pulse rounded" />,
});

type Tab = "personal" | "education" | "experience" | "skills";

// Memoized tab button component
const TabButton = memo(({ 
  tab, 
  isActive, 
  onClick 
}: { 
  tab: { id: Tab; label: string; icon: React.ComponentType<{ size?: number; className?: string }> }; 
  isActive: boolean; 
  onClick: (id: Tab) => void;
}) => {
  const Icon = tab.icon;
  const handleClick = useCallback(() => onClick(tab.id), [tab.id, onClick]);

  return (
    <button
      onClick={handleClick}
      className={clsx(
        "flex items-center gap-2 px-6 py-4 text-sm font-medium transition-all duration-200 whitespace-nowrap relative",
        isActive
          ? "text-[#DB4B2E] bg-[#FBEAE4]/60"
          : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
      )}
      aria-pressed={isActive}
      aria-label={`${tab.label} tab`}
    >
      {isActive && (
        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#DB4B2E] animate-in slide-in-from-left duration-200" />
      )}
      <Icon size={18} className={clsx("transition-transform duration-200", isActive && "scale-110")} />
      {tab.label}
    </button>
  );
});
TabButton.displayName = 'TabButton';

export const CVEditor: React.FC = React.memo(() => {
  const [activeTab, setActiveTab] = useState<Tab>("personal");
  const { isLoading, dataVersion } = useCVStore();

  // Memoize tabs array to prevent recreation on each render
  const tabs = useMemo(() => [
    { id: "personal" as Tab, label: "Personal", icon: User },
    { id: "education" as Tab, label: "Education", icon: GraduationCap },
    { id: "experience" as Tab, label: "Experience", icon: Briefcase },
    { id: "skills" as Tab, label: "Skills", icon: Wrench },
  ], []);

  const handleTabChange = useCallback((tabId: Tab) => {
    setActiveTab(tabId);
  }, []);

  // Memoize active form component to prevent unnecessary re-renders
  const activeForm = useMemo(() => {
    switch (activeTab) {
      case "personal":
        return <PersonalForm />;
      case "education":
        return <EducationForm />;
      case "experience":
        return <ExperienceForm />;
      case "skills":
        return <SkillsForm />;
      default:
        return null;
    }
  }, [activeTab]);

  if (isLoading) {
    return <EditorSkeleton />;
  }

  return (
    <div
      className="flex flex-col bg-white border-r border-gray-200"
      key={dataVersion}
    >
      <div className="flex border-b border-gray-200 overflow-x-auto">
        {tabs.map((tab) => (
          <TabButton
            key={tab.id}
            tab={tab}
            isActive={activeTab === tab.id}
            onClick={handleTabChange}
          />
        ))}
      </div>

      <div className="p-6 bg-gray-50/30 overflow-y-auto flex-1">
        <div className="max-w-2xl mx-auto">
          <div 
            key={activeTab} 
            className="opacity-0 animate-fade-in" 
            style={{ animation: "fadeIn 0.2s ease-in-out forwards" }}
          >
            {activeForm}
          </div>
        </div>
      </div>
    </div>
  );
});
CVEditor.displayName = 'CVEditor';
