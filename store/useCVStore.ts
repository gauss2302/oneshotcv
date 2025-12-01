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

  // Actions
  updatePersonal: (data: Partial<PersonalInfo>) => void;
  addEducation: () => void;
  updateEducation: (id: string, data: Partial<Education>) => void;
  removeEducation: (id: string) => void;
  addExperience: () => void;
  updateExperience: (id: string, data: Partial<Experience>) => void;
  removeExperience: (id: string) => void;
  reorderExperience: (oldIndex: number, newIndex: number) => void;
  addSkill: () => void;
  updateSkill: (id: string, data: Partial<Skill>) => void;
  removeSkill: (id: string) => void;
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

export const useCVStore = create<CVStore>((set, get) => ({
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

  updatePersonal: (data) =>
    set((state) => ({
      personalInfo: { ...state.personalInfo, ...data },
      hasUnsavedChanges: true,
    })),

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
    })),

  updateEducation: (id, data) =>
    set((state) => ({
      education: state.education.map((edu) =>
        edu.id === id ? { ...edu, ...data } : edu
      ),
      hasUnsavedChanges: true,
    })),

  removeEducation: (id) =>
    set((state) => ({
      education: state.education.filter((edu) => edu.id !== id),
      hasUnsavedChanges: true,
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
        },
      ],
      hasUnsavedChanges: true,
    })),

  updateExperience: (id, data) =>
    set((state) => ({
      experience: state.experience.map((exp) =>
        exp.id === id ? { ...exp, ...data } : exp
      ),
      hasUnsavedChanges: true,
    })),

  removeExperience: (id) =>
    set((state) => ({
      experience: state.experience.filter((exp) => exp.id !== id),
      hasUnsavedChanges: true,
    })),

  reorderExperience: (oldIndex, newIndex) =>
    set((state) => ({
      experience: arrayMove(state.experience, oldIndex, newIndex),
      hasUnsavedChanges: true,
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
    })),

  updateSkill: (id, data) =>
    set((state) => ({
      skills: state.skills.map((skill) =>
        skill.id === id ? { ...skill, ...data } : skill
      ),
      hasUnsavedChanges: true,
    })),

  removeSkill: (id) =>
    set((state) => ({
      skills: state.skills.filter((skill) => skill.id !== id),
      hasUnsavedChanges: true,
    })),

  setTemplate: (template) =>
    set(() => ({
      selectedTemplate: template,
      hasUnsavedChanges: true,
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
    set(() => ({
      hasUnsavedChanges: true,
    })),
}));
