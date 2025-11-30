import React from 'react';
import { CVState, CVDesignSettings } from '@/types/cv';
import { TemplateBlock, TemplateGenerator } from './types';

export const getExecutiveTemplateBlocks: TemplateGenerator = (data: CVState, settings: CVDesignSettings) => {
  const { personalInfo, education, experience, skills } = data;
  const { themeColor, fontFamily, scale } = settings;
  const blocks: TemplateBlock[] = [];

  // Executive Template: Sophisticated, authoritative, strong header
  
  const containerStyle = {
    fontFamily: fontFamily === 'serif' ? 'Georgia, serif' : fontFamily === 'mono' ? 'Courier New, monospace' : 'Times New Roman, serif',
    fontSize: `${0.95 * scale}rem`,
    lineHeight: 1.5,
    color: '#1f2937', // gray-800
  };

  const sectionTitleStyle = {
    fontSize: '1.2em',
    fontWeight: 'bold',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    borderBottom: `2px solid ${themeColor}`,
    marginBottom: '0.8em',
    paddingBottom: '0.2em',
    color: '#111827', // gray-900
  };

  // 1. Header Block
  blocks.push({
    id: 'header',
    content: (
      <div className="mb-8 border-4 p-6 text-center" style={{ ...containerStyle, borderColor: themeColor }}>
        {personalInfo.photo && (
          <div className="mb-6 flex justify-center">
            <img
              src={personalInfo.photo.url}
              alt={personalInfo.fullName}
              className="w-44 h-52 rounded-lg object-cover border-2"
              style={{ borderColor: themeColor }}
            />
          </div>
        )}
        <h1 className="text-4xl font-serif font-bold mb-2 text-gray-900 tracking-tight">
          {personalInfo.fullName}
        </h1>
        <p className="text-xl font-medium text-gray-600 mb-4 uppercase tracking-widest">{personalInfo.title}</p>
        
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm font-medium text-gray-700 border-t pt-4" style={{ borderColor: themeColor }}>
          {personalInfo.email && <span>{personalInfo.email}</span>}
          {personalInfo.phone && <span>{personalInfo.phone}</span>}
          {personalInfo.address && <span>{personalInfo.address}</span>}
        </div>
      </div>
    ),
  });

  // 2. Summary Block
  if (personalInfo.summary) {
    blocks.push({
      id: 'summary',
      content: (
        <div className="mb-8" style={containerStyle}>
          <h3 style={sectionTitleStyle}>Executive Profile</h3>
          <p className="text-gray-800 leading-relaxed text-justify">
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
        <div className="mb-4" style={containerStyle}>
          <h3 style={sectionTitleStyle}>Professional Experience</h3>
        </div>
      ),
    });

    experience.forEach((exp) => {
      blocks.push({
        id: `exp-${exp.id}`,
        content: (
          <div className="mb-6" style={containerStyle}>
            <div className="flex justify-between items-baseline mb-1">
              <h4 className="font-bold text-lg text-gray-900">{exp.position}</h4>
              <span className="text-sm font-bold text-gray-600">
                {exp.startDate} – {exp.current ? 'Present' : exp.endDate}
              </span>
            </div>
            <div className="font-semibold text-lg mb-2" style={{ color: themeColor }}>{exp.company}</div>
            <p className="text-gray-800 text-sm whitespace-pre-wrap leading-relaxed">
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
        <div className="mb-4" style={containerStyle}>
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
              <h4 className="font-bold text-lg text-gray-900">{edu.institution}</h4>
              <span className="text-sm font-medium text-gray-600">
                {edu.startDate} – {edu.current ? 'Present' : edu.endDate}
              </span>
            </div>
            <div className="text-gray-800 font-medium">{edu.degree}</div>
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
          <h3 style={sectionTitleStyle}>Core Competencies</h3>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2">
            {skills.map(s => (
              <div key={s.id} className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-gray-900 rounded-full"></div>
                <span className="font-medium text-gray-800">{s.name}</span>
              </div>
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
