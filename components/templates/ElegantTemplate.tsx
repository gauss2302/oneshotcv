import React from 'react';
import { CVState, CVDesignSettings } from '@/types/cv';
import { TemplateBlock, TemplateGenerator } from './types';

export const getElegantTemplateBlocks: TemplateGenerator = (data: CVState, settings: CVDesignSettings) => {
  const { personalInfo, education, experience, skills } = data;
  const { themeColor, fontFamily, scale } = settings;
  const blocks: TemplateBlock[] = [];

  // Elegant Template: Centered, refined, delicate dividers
  
  const containerStyle = {
    fontFamily: fontFamily === 'serif' ? 'Garamond, serif' : fontFamily === 'mono' ? 'Courier New, monospace' : 'Optima, sans-serif',
    fontSize: `${0.9 * scale}rem`,
    lineHeight: 1.6,
    color: '#444',
  };

  const sectionTitleStyle = {
    fontSize: '1.1em',
    fontWeight: 'normal',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.2em',
    textAlign: 'center' as const,
    marginBottom: '1.5em',
    color: themeColor,
    position: 'relative' as const,
  };

  const divider = (
    <div className="flex justify-center items-center gap-2 my-1 opacity-50">
      <div className="h-px w-8 bg-gray-300"></div>
      <div className="w-1 h-1 rounded-full bg-gray-400"></div>
      <div className="h-px w-8 bg-gray-300"></div>
    </div>
  );

  // 1. Header Block
  blocks.push({
    id: 'header',
    content: (
      <div className="mb-10 text-center" style={containerStyle}>
        <h1 className="text-4xl font-light mb-3 tracking-wider text-gray-900">
          {personalInfo.fullName}
        </h1>
        <p className="text-lg text-gray-500 mb-6 tracking-widest uppercase text-xs">{personalInfo.title}</p>
        
        <div className="flex justify-center gap-6 text-sm text-gray-500 italic">
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
        <div className="mb-10 max-w-xl mx-auto text-center" style={containerStyle}>
          <div className="mb-4">{divider}</div>
          <p className="text-gray-600 leading-loose italic">
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
        <div className="mb-6 mt-8" style={containerStyle}>
          <h3 style={sectionTitleStyle}>Experience</h3>
        </div>
      ),
    });

    experience.forEach((exp) => {
      blocks.push({
        id: `exp-${exp.id}`,
        content: (
          <div className="mb-8 text-center" style={containerStyle}>
            <h4 className="font-bold text-lg text-gray-800 mb-1">{exp.position}</h4>
            <div className="text-sm text-gray-500 mb-2 uppercase tracking-wide">
              {exp.company} | {exp.startDate} – {exp.current ? 'Present' : exp.endDate}
            </div>
            <p className="text-gray-600 text-sm max-w-2xl mx-auto">
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
        <div className="mb-6 mt-8" style={containerStyle}>
          <h3 style={sectionTitleStyle}>Education</h3>
        </div>
      ),
    });

    education.forEach((edu) => {
      blocks.push({
        id: `edu-${edu.id}`,
        content: (
          <div className="mb-6 text-center" style={containerStyle}>
            <h4 className="font-bold text-gray-800">{edu.institution}</h4>
            <div className="text-gray-600 italic mb-1">{edu.degree}</div>
            <div className="text-xs text-gray-400 uppercase tracking-widest">
              {edu.startDate} – {edu.current ? 'Present' : edu.endDate}
            </div>
            {edu.description && <p className="text-sm mt-2 text-gray-500">{edu.description}</p>}
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
        <div className="mb-8 mt-8 text-center" style={containerStyle}>
          <h3 style={sectionTitleStyle}>Expertise</h3>
          <div className="flex flex-wrap justify-center gap-4">
            {skills.map(s => (
              <span key={s.id} className="text-sm text-gray-600 border-b border-gray-200 pb-0.5">
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
