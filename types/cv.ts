export interface Photo {
  id: string;
  url: string; // Public URL to processed image
  originalUrl?: string; // URL to original (for re-cropping)
  cropData?: {
    x: number;
    y: number;
    width: number;
    height: number;
    zoom?: number;
  };
  fileName: string;
  fileSize: number;
  mimeType: string;
  resumePhotoId?: string; // Resume-specific attachment id
}

export interface PersonalInfo {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  summary: string;
  title: string;
  location?: string;
  photo?: Photo;
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
}

export interface Experience {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
}

export interface Skill {
  id: string;
  name: string;
  level: number; // 1-5 or similar
}

export interface CVDesignSettings {
  themeColor: string;
  fontFamily: 'sans' | 'serif' | 'mono' | 'times';
  scale: number;
  textAlignment: 'left' | 'center' | 'right' | 'justify';
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
}
