import { CVDesignSettings, CVState, PersonalInfo } from "@/types/cv";

export const initialPersonalInfo: PersonalInfo = {
  fullName: "",
  email: "",
  phone: "",
  address: "",
  summary: "",
  title: "",
  location: "",
  photo: undefined,
};

export const initialDesignSettings: CVDesignSettings = {
  themeColor: "#3b82f6",
  fontFamily: "sans",
  scale: 1,
  textAlignment: "left",
  fontSizes: {
    header: 2.25,
    sectionTitle: 1.5,
    body: 1,
  },
  spacing: {
    lineHeight: 1.6,
    sectionPadding: 2,
    itemGap: 1,
  },
};

export const createEmptyCVState = (): CVState => ({
  personalInfo: { ...initialPersonalInfo, photo: undefined },
  education: [],
  experience: [],
  skills: [],
  designSettings: {
    ...initialDesignSettings,
    fontSizes: { ...initialDesignSettings.fontSizes },
    spacing: { ...initialDesignSettings.spacing },
  },
});
