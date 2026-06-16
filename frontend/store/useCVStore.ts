import { create } from "zustand";
import {
  CVState,
  PersonalInfo,
  Education,
  Experience,
  Skill,
  CVDesignSettings,
} from "@/types/cv";
import {
  createEmptyCVState,
  initialDesignSettings,
  initialPersonalInfo,
} from "@/lib/resume/defaultCvState";
import { arrayMove } from "@dnd-kit/sortable";

interface CVStore extends CVState {
  resumeId: string | null;
  selectedTemplate: string;

  // Loading & sync states
  isLoading: boolean;
  isSaving: boolean;
  lastSavedAt: Date | null;
  hasUnsavedChanges: boolean;

  // Data version to track changes (for form reset)
  dataVersion: number;

  // Monotonic counter incremented on every user-driven mutation. The save
  // hook snapshots it before sending and only marks the resume "saved" if
  // it hasn't moved during the round-trip — otherwise typing that happened
  // while a save was in flight would be silently cleared.
  mutationCount: number;

  // Actions
  updatePersonal: (data: Partial<PersonalInfo>) => void;
  addEducation: () => void;
  updateEducation: (id: string, data: Partial<Education>) => void;
  removeEducation: (id: string) => void;
  reorderEducation: (oldIndex: number, newIndex: number) => void;
  addExperience: () => void;
  updateExperience: (id: string, data: Partial<Experience>) => void;
  removeExperience: (id: string) => void;
  reorderExperience: (oldIndex: number, newIndex: number) => void;
  addSkill: () => void;
  updateSkill: (id: string, data: Partial<Skill>) => void;
  removeSkill: (id: string) => void;
  reorderSkill: (oldIndex: number, newIndex: number) => void;
  setTemplate: (template: string) => void;
  updateDesign: (settings: Partial<CVDesignSettings>) => void;
  setResume: (content: Partial<CVState> & { summary?: string }) => void;
  setResumeId: (id: string) => void;
  resetStore: () => void;

  // Loading & sync actions
  setIsLoading: (loading: boolean) => void;
  setIsSaving: (saving: boolean) => void;
  setSaved: () => void;
  markUnsaved: () => void;
}

const generateId = () => Math.random().toString(36).substring(2, 9);

function hasPersonalInfoChanges(
  current: PersonalInfo,
  patch: Partial<PersonalInfo>
): boolean {
  return Object.entries(patch).some(([key, value]) => {
    const field = key as keyof PersonalInfo;
    return current[field] !== value;
  });
}

export const useCVStore = create<CVStore>((set) => ({
  // Initial state
  ...createEmptyCVState(),
  resumeId: null,
  selectedTemplate: "classic",

  // Loading & sync states
  isLoading: true,
  isSaving: false,
  lastSavedAt: null,
  hasUnsavedChanges: false,
  dataVersion: 0,
  mutationCount: 0,

  updatePersonal: (data) =>
    set((state) => {
      if (!hasPersonalInfoChanges(state.personalInfo, data)) {
        return state;
      }

      return {
        personalInfo: { ...state.personalInfo, ...data },
        hasUnsavedChanges: true,
        mutationCount: state.mutationCount + 1,
      };
    }),

  addEducation: () =>
    set((state) => ({
      education: [
        ...state.education,
        {
          id: generateId(),
          institution: "",
          degree: "",
          startDate: "",
          endDate: "",
          description: "",
        },
      ],
      hasUnsavedChanges: true,
      mutationCount: state.mutationCount + 1,
    })),

  updateEducation: (id, data) =>
    set((state) => ({
      education: state.education.map((edu) =>
        edu.id === id ? { ...edu, ...data } : edu
      ),
      hasUnsavedChanges: true,
      mutationCount: state.mutationCount + 1,
    })),

  removeEducation: (id) =>
    set((state) => ({
      education: state.education.filter((edu) => edu.id !== id),
      hasUnsavedChanges: true,
      mutationCount: state.mutationCount + 1,
    })),

  reorderEducation: (oldIndex, newIndex) =>
    set((state) => ({
      education: arrayMove(state.education, oldIndex, newIndex),
      hasUnsavedChanges: true,
      mutationCount: state.mutationCount + 1,
    })),

  addExperience: () =>
    set((state) => ({
      experience: [
        ...state.experience,
        {
          id: generateId(),
          company: "",
          position: "",
          startDate: "",
          endDate: "",
          location: "",
          description: "",
          current: false,
          isCurrent: false,
        },
      ],
      hasUnsavedChanges: true,
      mutationCount: state.mutationCount + 1,
    })),

  updateExperience: (id, data) =>
    set((state) => ({
      experience: state.experience.map((exp) =>
        exp.id === id ? { ...exp, ...data } : exp
      ),
      hasUnsavedChanges: true,
      mutationCount: state.mutationCount + 1,
    })),

  removeExperience: (id) =>
    set((state) => ({
      experience: state.experience.filter((exp) => exp.id !== id),
      hasUnsavedChanges: true,
      mutationCount: state.mutationCount + 1,
    })),

  reorderExperience: (oldIndex, newIndex) =>
    set((state) => ({
      experience: arrayMove(state.experience, oldIndex, newIndex),
      hasUnsavedChanges: true,
      mutationCount: state.mutationCount + 1,
    })),

  addSkill: () =>
    set((state) => ({
      skills: [
        ...state.skills,
        {
          id: generateId(),
          name: "",
          level: 3,
        },
      ],
      hasUnsavedChanges: true,
      mutationCount: state.mutationCount + 1,
    })),

  updateSkill: (id, data) =>
    set((state) => ({
      skills: state.skills.map((skill) =>
        skill.id === id ? { ...skill, ...data } : skill
      ),
      hasUnsavedChanges: true,
      mutationCount: state.mutationCount + 1,
    })),

  removeSkill: (id) =>
    set((state) => ({
      skills: state.skills.filter((skill) => skill.id !== id),
      hasUnsavedChanges: true,
      mutationCount: state.mutationCount + 1,
    })),

  reorderSkill: (oldIndex, newIndex) =>
    set((state) => ({
      skills: arrayMove(state.skills, oldIndex, newIndex),
      hasUnsavedChanges: true,
      mutationCount: state.mutationCount + 1,
    })),

  setTemplate: (template) =>
    set((state) => ({
      selectedTemplate: template,
      hasUnsavedChanges: true,
      mutationCount: state.mutationCount + 1,
    })),

  updateDesign: (settings) =>
    set((state) => ({
      designSettings: {
        ...state.designSettings,
        ...settings,
        fontSizes: {
          ...state.designSettings.fontSizes,
          ...settings.fontSizes,
        },
        spacing: {
          ...state.designSettings.spacing,
          ...settings.spacing,
        },
      },
      hasUnsavedChanges: true,
      mutationCount: state.mutationCount + 1,
    })),

  setResume: (content) =>
    set((state) => {
      const newPersonalInfo: PersonalInfo = {
        ...initialPersonalInfo,
        ...content.personalInfo,
        photo: content.personalInfo?.photo ?? undefined,
      };

      if (content.summary) {
        newPersonalInfo.summary = content.summary;
      }

      return {
        personalInfo: newPersonalInfo,
        education: content.education ?? [],
        experience: content.experience ?? [],
        skills: content.skills ?? [],
        selectedTemplate: content.selectedTemplate ?? state.selectedTemplate,
        designSettings: {
          ...initialDesignSettings,
          ...content.designSettings,
          fontSizes: {
            ...initialDesignSettings.fontSizes,
            ...content.designSettings?.fontSizes,
          },
          spacing: {
            ...initialDesignSettings.spacing,
            ...content.designSettings?.spacing,
          },
        },
        // Increment version to trigger form resets
        dataVersion: state.dataVersion + 1,
        hasUnsavedChanges: false,
        isSaving: false,
      };
    }),

  setResumeId: (id) =>
    set(() => ({
      resumeId: id,
    })),

  resetStore: () =>
    set((state) => ({
      ...createEmptyCVState(),
      resumeId: null,
      selectedTemplate: "classic",
      isLoading: true,
      hasUnsavedChanges: false,
      dataVersion: state.dataVersion + 1,
    })),

  // Loading & sync actions
  setIsLoading: (loading) =>
    set(() => ({
      isLoading: loading,
    })),

  setIsSaving: (saving) =>
    set(() => ({
      isSaving: saving,
    })),

  setSaved: () =>
    set(() => ({
      isSaving: false,
      hasUnsavedChanges: false,
      lastSavedAt: new Date(),
    })),

  markUnsaved: () =>
    set((state) => ({
      hasUnsavedChanges: true,
      mutationCount: state.mutationCount + 1,
    })),
}));
