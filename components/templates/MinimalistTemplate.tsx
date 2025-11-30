import React from 'react';
import { CVState, CVDesignSettings } from '@/types/cv';
import { TemplateBlock, TemplateGenerator } from './types';

export const getMinimalistTemplateBlocks: TemplateGenerator = (data: CVState, settings: CVDesignSettings) => {
  const { personalInfo, education, experience, skills } = data;
  const { themeColor, fontFamily, scale } = settings;
  const blocks: TemplateBlock[] = [];

  // Minimalist Template: Clean, text-only, single column, high readability
  
  const containerStyle = {
    fontFamily: fontFamily === 'serif' ? 'Georgia, serif' : fontFamily === 'mono' ? 'Courier New, monospace' : 'Arial, Helvetica, sans-serif',
    fontSize: `${0.9 * scale}rem`,
    lineHeight: 1.5,
    color: '#000000',
  };

  const sectionHeaderStyle = {
    fontSize: '1.1em',
    fontWeight: 'bold',
    textTransform: 'uppercase' as const,
    borderBottom: `1px solid ${themeColor}`,
    marginBottom: '0.5em',
    paddingBottom: '0.1em',
    color: themeColor,
  };

  // 1. Header Block
  blocks.push({
    id: 'header',
    content: (
      <div className="mb-6" style={containerStyle}>
        <h1 className="text-2xl font-bold mb-1 text-center uppercase tracking-wide" style={{ color: themeColor }}>
          {personalInfo.fullName}
        </h1>
        <div className="text-center text-sm mb-2">
          {personalInfo.address && <span>{personalInfo.address} • </span>}
          {personalInfo.phone && <span>{personalInfo.phone} • </span>}
          {personalInfo.email && <span>{personalInfo.email}</span>}
        </div>
      </div>
    ),
  });

  // 2. Summary Block
  if (personalInfo.summary) {
    blocks.push({
      id: 'summary',
      content: (
        <div className="mb-6" style={containerStyle}>
          <h3 style={sectionHeaderStyle}>Professional Summary</h3>
          <p className="text-justify">
            {personalInfo.summary}
          </p>
        </div>
      ),
    });
  }

  // 3. Experience Blocks
  if (experience.length > 0) {
    blocks.push({
      id: 'experience-title',
      content: (
        <div className="mb-2" style={containerStyle}>
          <h3 style={sectionHeaderStyle}>Work Experience</h3>
        </div>
      ),
    });

    experience.forEach((exp) => {
      blocks.push({
        id: `exp-${exp.id}`,
        content: (
          <div className="mb-4" style={containerStyle}>
            <div className="flex justify-between font-bold">
              <span>{exp.company}</span>
              <span>{exp.startDate} – {exp.current ? 'Present' : exp.endDate}</span>
            </div>
            <div className="italic mb-1">{exp.position}</div>
            <p className="whitespace-pre-wrap text-sm">
              {exp.description}
            </p>
          </div>
        ),
      });
    });
  }

  // 4. Education Blocks
  if (education.length > 0) {
    blocks.push({
      id: 'education-title',
      content: (
        <div className="mb-2" style={containerStyle}>
          <h3 style={sectionHeaderStyle}>Education</h3>
        </div>
      ),
    });

    education.forEach((edu) => {
      blocks.push({
        id: `edu-${edu.id}`,
        content: (
          <div className="mb-4" style={containerStyle}>
            <div className="flex justify-between font-bold">
              <span>{edu.institution}</span>
              <span>{edu.startDate} – {edu.current ? 'Present' : edu.endDate}</span>
            </div>
            <div>{edu.degree}</div>
            {edu.description && <p className="text-sm mt-1">{edu.description}</p>}
          </div>
        ),
      });
    });
  }

  // 5. Skills Block
  if (skills.length > 0) {
    blocks.push({
      id: 'skills',
      content: (
        <div className="mb-6" style={containerStyle}>
          <h3 style={sectionHeaderStyle}>Skills</h3>
          <p>
            {skills.map(s => s.name).join(', ')}
          </p>
        </div>
      ),
    });
  }

  // Footer
  blocks.push({
    id: 'footer',
    content: (
      <div style={{ ...containerStyle, marginTop: '2rem', textAlign: 'center', fontSize: '0.75rem', color: '#9ca3af' }}>
        Built by <span style={{ fontWeight: 'bold', color: themeColor }}>oneshotcv.art</span> with love
      </div>
    ),
  });

  return blocks;
};
