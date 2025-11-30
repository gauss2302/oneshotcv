import React from 'react';
import { CVState, CVDesignSettings } from '@/types/cv';

export interface TemplateBlock {
  id: string;
  content: React.ReactNode;
}

export type TemplateGenerator = (data: CVState, settings: CVDesignSettings) => TemplateBlock[];
