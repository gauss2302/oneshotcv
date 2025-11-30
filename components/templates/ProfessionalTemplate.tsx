import React from 'react';
import { CVState, CVDesignSettings } from '@/types/cv';
import { TemplateBlock, TemplateGenerator } from './types';

export const getProfessionalTemplateBlocks: TemplateGenerator = (data: CVState, settings: CVDesignSettings) => {
  const { personalInfo, education, experience, skills } = data;
  const { themeColor, fontFamily, scale } = settings;
  const blocks: TemplateBlock[] = [];

  // Professional Template: Traditional, structured, clear hierarchy
  
  const containerStyle = {
    fontFamily: fontFamily === 'serif' ? 'Times New Roman, serif' : fontFamily === 'mono' ? 'Courier New, monospace' : 'Arial, sans-serif',
    fontSize: `${0.95 * scale}rem`,
    lineHeight: 1.4,
    color: '#111',
  };

  const sectionTitleStyle = {
    fontSize: '1.15em',
    fontWeight: 'bold',
    textTransform: 'uppercase' as const,
    borderBottom: `2px solid ${themeColor}`,
    marginBottom: '0.75em',
    paddingBottom: '0.2em',
    color: themeColor,
  };

  // 1. Header Block
  blocks.push({
    id: 'header',
    content: (
      <div className="mb-6 border-b pb-4" style={{ ...containerStyle, borderColor: themeColor }}>
        <h1 className="text-3xl font-bold mb-2 text-gray-900">
          {personalInfo.fullName}
        </h1>
        <p className="text-lg font-medium text-gray-600 mb-3">{personalInfo.title}</p>
        <div className="flex flex-wrap gap-4 text-sm text-gray-700">
          {personalInfo.email && <span>Email: {personalInfo.email}</span>}
          {personalInfo.phone && <span>Phone: {personalInfo.phone}</span>}
          {personalInfo.address && <span>Location: {personalInfo.address}</span>}
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
          <h3 style={sectionTitleStyle}>Summary</h3>
          <p className="text-gray-800 leading-relaxed">
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
        <div className="mb-3" style={containerStyle}>
          <h3 style={sectionTitleStyle}>Professional Experience</h3>
        </div>
      ),
    });

    experience.forEach((exp) => {
      blocks.push({
        id: `exp-${exp.id}`,
        content: (
          <div className="mb-5" style={containerStyle}>
            <div className="flex justify-between items-baseline mb-1">
              <h4 className="font-bold text-lg">{exp.position}</h4>
              <span className="text-sm font-medium text-gray-600">
                {exp.startDate} – {exp.current ? 'Present' : exp.endDate}
              </span>
            </div>
            <div className="font-semibold text-gray-700 mb-2">{exp.company}</div>
            <p className="text-gray-800 text-sm whitespace-pre-wrap">
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
        <div className="mb-3" style={containerStyle}>
          <h3 style={sectionTitleStyle}>Education</h3>
        </div>
      ),
    });

    education.forEach((edu) => {
      blocks.push({
        id: `edu-${edu.id}`,
        content: (
          <div className="mb-4" style={containerStyle}>
            <div className="flex justify-between items-baseline">
              <h4 className="font-bold">{edu.institution}</h4>
              <span className="text-sm text-gray-600">
                {edu.startDate} – {edu.current ? 'Present' : edu.endDate}
              </span>
            </div>
            <div className="text-gray-700">{edu.degree}</div>
            {edu.description && <p className="text-sm mt-1 text-gray-600">{edu.description}</p>}
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
          <h3 style={sectionTitleStyle}>Skills</h3>
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            {skills.map(s => (
              <span key={s.id} className="bg-gray-100 px-2 py-1 rounded text-sm border border-gray-200">
                {s.name}
              </span>
            ))}
          </div>
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
