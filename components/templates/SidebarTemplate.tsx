import React from 'react';
import { CVState, CVDesignSettings } from '@/types/cv';
import { TemplateBlock, TemplateGenerator } from './types';
import { Mail, Phone, MapPin, Globe, Linkedin, Github } from 'lucide-react';

export const getSidebarTemplateBlocks: TemplateGenerator = (data: CVState, settings: CVDesignSettings) => {
  const { personalInfo, education, experience, skills } = data;
  const { themeColor, fontFamily, scale } = settings;
  const blocks: TemplateBlock[] = [];

  // Base styles
  const baseStyle = {
    fontFamily: fontFamily === 'serif' ? 'Georgia, serif' : fontFamily === 'mono' ? 'Courier New, monospace' : 'ui-sans-serif, system-ui, sans-serif',
    fontSize: `${0.9 * scale}rem`,
    lineHeight: 1.6,
    color: '#334155', // slate-700
  };

  const sidebarWidth = '30%';
  const mainContentMargin = '34%'; // 30% + gap

  // 1. Sidebar Container (Absolute Positioned Overlay)
  // This block has 0 height in the flow but renders the sidebar for the first page
  blocks.push({
    id: 'sidebar-container',
    content: (
      <div style={{ height: 0, overflow: 'visible', position: 'relative' }}>
        <div 
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: sidebarWidth,
            minHeight: '290mm', // Full A4 height approx
            backgroundColor: themeColor,
            padding: '2rem',
            boxSizing: 'border-box',
            ...baseStyle,
            color: 'white'
          }}
        >
          {/* Profile Photo */}
          {personalInfo.photo && (
            <div className="mb-6 flex justify-center">
              <img
                src={personalInfo.photo.url}
                alt={personalInfo.fullName}
                className="w-40 h-40 rounded-full object-cover border-4 border-white/20"
                style={{ aspectRatio: '1/1' }}
              />
            </div>
          )}

          {/* Name & Title */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2 leading-tight" style={{ color: 'white' }}>
              {personalInfo.fullName}
            </h1>
            <p className="text-lg opacity-90 font-medium" style={{ color: 'rgba(255,255,255,0.9)' }}>
              {personalInfo.title}
            </p>
          </div>

          {/* Contact Info */}
          <div className="mb-8 space-y-3 text-sm">
            {personalInfo.email && (
              <div className="flex items-center gap-2">
                <Mail size={14} className="shrink-0 opacity-80" />
                <span className="break-all">{personalInfo.email}</span>
              </div>
            )}
            {personalInfo.phone && (
              <div className="flex items-center gap-2">
                <Phone size={14} className="shrink-0 opacity-80" />
                <span>{personalInfo.phone}</span>
              </div>
            )}
            {personalInfo.address && (
              <div className="flex items-center gap-2">
                <MapPin size={14} className="shrink-0 opacity-80" />
                <span>{personalInfo.address}</span>
              </div>
            )}
          </div>

          {/* Skills in Sidebar */}
          {skills.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-bold mb-4 border-b border-white/30 pb-1 uppercase tracking-wider">
                Skills
              </h3>
              <div className="flex flex-wrap gap-2">
                {skills.map(skill => (
                  <span 
                    key={skill.id}
                    className="px-2 py-1 bg-white/20 rounded text-sm backdrop-blur-sm"
                  >
                    {skill.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    ),
  });

  // 2. Main Content Area (Summary)
  if (personalInfo.summary) {
    blocks.push({
      id: 'summary',
      content: (
        <div style={{ marginLeft: mainContentMargin, ...baseStyle }} className="mb-6">
          <h3 className="text-xl font-bold mb-3 text-gray-800 border-b-2 pb-1" style={{ borderColor: themeColor }}>
            Profile
          </h3>
          <p className="text-gray-600 leading-relaxed">
            {personalInfo.summary}
          </p>
        </div>
      ),
    });
  }

  // 3. Experience
  if (experience.length > 0) {
    blocks.push({
      id: 'experience-title',
      content: (
        <div style={{ marginLeft: mainContentMargin, ...baseStyle }} className="mb-4">
          <h3 className="text-xl font-bold text-gray-800 border-b-2 pb-1" style={{ borderColor: themeColor }}>
            Experience
          </h3>
        </div>
      ),
    });

    experience.forEach(exp => {
      blocks.push({
        id: `exp-${exp.id}`,
        content: (
          <div style={{ marginLeft: mainContentMargin, ...baseStyle }} className="mb-6">
            <div className="flex justify-between items-baseline mb-1">
              <h4 className="font-bold text-lg text-gray-900">{exp.position}</h4>
              <span className="text-sm font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
              </span>
            </div>
            <div className="text-md font-semibold mb-2" style={{ color: themeColor }}>
              {exp.company}
            </div>
            <p className="text-gray-600 text-sm whitespace-pre-line">
              {exp.description}
            </p>
          </div>
        ),
      });
    });
  }

  // 4. Education
  if (education.length > 0) {
    blocks.push({
      id: 'education-title',
      content: (
        <div style={{ marginLeft: mainContentMargin, ...baseStyle }} className="mb-4">
          <h3 className="text-xl font-bold text-gray-800 border-b-2 pb-1" style={{ borderColor: themeColor }}>
            Education
          </h3>
        </div>
      ),
    });

    education.forEach(edu => {
      blocks.push({
        id: `edu-${edu.id}`,
        content: (
          <div style={{ marginLeft: mainContentMargin, ...baseStyle }} className="mb-6">
            <div className="flex justify-between items-baseline mb-1">
              <h4 className="font-bold text-lg text-gray-900">{edu.institution}</h4>
              <span className="text-sm font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                {edu.startDate} - {edu.endDate || 'Present'}
              </span>
            </div>
            <div className="text-md font-semibold" style={{ color: themeColor }}>
              {edu.degree}
            </div>
            {edu.description && (
              <p className="text-gray-600 text-sm mt-1">
                {edu.description}
              </p>
            )}
          </div>
        ),
      });
    });
  }

  return blocks;
};
