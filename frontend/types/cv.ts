export interface PhotoData {
  id: string;
  resumePhotoId?: string;
  url: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  cropData?: {
    x: number;
    y: number;
    width: number;
    height: number;
    zoom?: number;
  };
}

export interface PersonalInfo {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  summary: string;
  title: string;
  location?: string;
  photo?: PhotoData;
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  startDate: string;
  endDate: string;
  description: string;
  current?: boolean;
}

export interface Experience {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  location: string;
  description: string;
  current?: boolean;
  isCurrent?: boolean;
}

export interface Skill {
  id: string;
  name: string;
  level: number;
}

export interface CVDesignSettings {
  themeColor: string;
  fontFamily: "sans" | "serif" | "mono" | "times";
  scale: number;
  textAlignment: "left" | "center" | "right" | "justify";
  fontSizes: {
    header: number;
    sectionTitle: number;
    body: number;
  };
  spacing: {
    lineHeight: number;
    sectionPadding: number;
    itemGap: number;
  };
}

export interface CVState {
  personalInfo: PersonalInfo;
  education: Education[];
  experience: Experience[];
  skills: Skill[];
  designSettings: CVDesignSettings;
  selectedTemplate?: string;
}
