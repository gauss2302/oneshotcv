import { create } from 'zustand';
import { CVState, Education, Experience, PersonalInfo, Skill, CVDesignSettings } from '@/types/cv';
import { v4 as uuidv4 } from 'uuid';
import { createEmptyCVState } from '@/lib/resume/defaultCvState';

interface CVStore extends CVState {
  resumeId: string | null;
  setResumeId: (id: string | null) => void;

  selectedTemplate: string;
  setTemplate: (template: string) => void;

  updatePersonal: (info: Partial<PersonalInfo>) => void;
  updateDesign: (settings: Partial<CVDesignSettings>) => void;

  addEducation: () => void;
  removeEducation: (id: string) => void;
  updateEducation: (id: string, edu: Partial<Education>) => void;

  addExperience: () => void;
  removeExperience: (id: string) => void;
  updateExperience: (id: string, exp: Partial<Experience>) => void;

  addSkill: () => void;
  removeSkill: (id: string) => void;
  updateSkill: (id: string, skill: Partial<Skill>) => void;

  reorderExperience: (startIndex: number, endIndex: number) => void;
  setResume: (state: CVState & { selectedTemplate?: string; resumeId?: string }) => void;
}

export const useCVStore = create<CVStore>()((set) => {
  const initialState = createEmptyCVState();
  return {
    personalInfo: initialState.personalInfo,
    education: initialState.education,
    experience: initialState.experience,
    skills: initialState.skills,
    designSettings: initialState.designSettings,

    resumeId: null,
    setResumeId: (id) => set({ resumeId: id }),

    updatePersonal: (info) =>
      set((state) => ({
        personalInfo: { ...state.personalInfo, ...info },
      })),

    selectedTemplate: 'classic',
    setTemplate: (template) => set({ selectedTemplate: template }),

    updateDesign: (settings) =>
      set((state) => ({
        designSettings: { ...state.designSettings, ...settings },
      })),

    addEducation: () =>
      set((state) => ({
        education: [
          ...state.education,
          {
            id: uuidv4(),
            institution: '',
            degree: '',
            startDate: '',
            endDate: '',
            current: false,
            description: '',
          },
        ],
      })),

    removeEducation: (id) =>
      set((state) => ({
        education: state.education.filter((edu) => edu.id !== id),
      })),

    updateEducation: (id, edu) =>
      set((state) => ({
        education: state.education.map((item) =>
          item.id === id ? { ...item, ...edu } : item
        ),
      })),

    addExperience: () =>
      set((state) => ({
        experience: [
          ...state.experience,
          {
            id: uuidv4(),
            company: '',
            position: '',
            startDate: '',
            endDate: '',
            current: false,
            description: '',
          },
        ],
      })),

    removeExperience: (id) =>
      set((state) => ({
        experience: state.experience.filter((exp) => exp.id !== id),
      })),

    updateExperience: (id, exp) =>
      set((state) => ({
        experience: state.experience.map((item) =>
          item.id === id ? { ...item, ...exp } : item
        ),
      })),

    addSkill: () =>
      set((state) => ({
        skills: [...state.skills, { id: uuidv4(), name: '', level: 3 }],
      })),

    removeSkill: (id) =>
      set((state) => ({
        skills: state.skills.filter((skill) => skill.id !== id),
      })),

    updateSkill: (id, skill) =>
      set((state) => ({
        skills: state.skills.map((item) =>
          item.id === id ? { ...item, ...skill } : item
        ),
      })),

    reorderExperience: (startIndex, endIndex) =>
      set((state) => {
        const result = Array.from(state.experience);
        const [removed] = result.splice(startIndex, 1);
        result.splice(endIndex, 0, removed);
        return { experience: result };
      }),

    setResume: (state) =>
      set((current) => ({
        ...current,
        personalInfo: state.personalInfo ?? current.personalInfo,
        education: state.education ?? current.education,
        experience: state.experience ?? current.experience,
        skills: state.skills ?? current.skills,
        designSettings: state.designSettings ?? current.designSettings,
        ...(state.selectedTemplate
          ? { selectedTemplate: state.selectedTemplate }
          : {}),
        ...(state.resumeId ? { resumeId: state.resumeId } : {}),
      })),
  };
});
