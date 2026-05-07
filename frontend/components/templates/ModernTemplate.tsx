import React from 'react';
import { CVState, CVDesignSettings } from '@/types/cv';
import { TemplateBlock, TemplateGenerator } from './types';
import { Mail, Phone, MapPin } from 'lucide-react';

const colors = {
  sidebarBg: '#1e293b', // slate-800
  sidebarText: '#f8fafc', // slate-50
  mainBg: '#ffffff',
  textMain: '#334155', // slate-700
  textSec: '#64748b', // slate-500
  accent: '#3b82f6', // blue-500
};

export const getModernTemplateBlocks: TemplateGenerator = (data: CVState, settings: CVDesignSettings) => {
  const { personalInfo, education, experience, skills } = data;
  const { themeColor, fontFamily, scale } = settings;
  const blocks: TemplateBlock[] = [];

  // Base styles
  const containerStyle = {
    fontFamily: fontFamily === 'serif' ? 'Georgia, serif' : fontFamily === 'mono' ? 'Courier New, monospace' : 'ui-sans-serif, system-ui, sans-serif',
    fontSize: `${0.9 * scale}rem`,
    lineHeight: 1.6,
    color: '#374151', // gray-700
  };

  // 1. Header Block (Left-aligned with accent bar)
  blocks.push({
    id: 'header',
    content: (
      <div className="mb-8 flex" style={containerStyle}>
        <div className="w-1.5 self-stretch mr-6 rounded-full" style={{ backgroundColor: themeColor }}></div>
        <div className="flex-1 flex items-start gap-6">
          {personalInfo.photo && (
            <img
              src={personalInfo.photo.url}
              alt={personalInfo.fullName}
              className="w-32 h-32 rounded-lg object-cover flex-shrink-0 border-2"
              style={{ borderColor: themeColor }}
            />
          )}
          <div className="flex-1">
            <h1 className="text-4xl font-extrabold text-gray-900 mb-1 tracking-tight" style={{ color: themeColor }}>
              {personalInfo.fullName}
            </h1>
            <p className="text-xl font-medium text-gray-500 mb-4">{personalInfo.title}</p>

            <div className="flex flex-wrap gap-y-2 gap-x-6 text-sm text-gray-600">
              {personalInfo.email && (
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-full bg-gray-100 text-gray-600">
                    <Mail size={12} />
                  </div>
                  <span>{personalInfo.email}</span>
                </div>
              )}
              {personalInfo.phone && (
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-full bg-gray-100 text-gray-600">
                    <Phone size={12} />
                  </div>
                  <span>{personalInfo.phone}</span>
                </div>
              )}
              {personalInfo.address && (
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-full bg-gray-100 text-gray-600">
                    <MapPin size={12} />
                  </div>
                  <span>{personalInfo.address}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    ),
  });

  // 2. Summary Block
  if (personalInfo.summary) {
    blocks.push({
      id: 'summary',
      content: (
        <div className="mb-8 bg-gray-50 p-6 rounded-xl border-l-4" style={{ ...containerStyle, borderLeftColor: themeColor }}>
          <p className="text-gray-700 italic leading-relaxed">
            &quot;{personalInfo.summary}&quot;
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
        <div className="mb-6 flex items-center gap-3" style={containerStyle}>
          <div className="h-px flex-1 bg-gray-200"></div>
          <h3 className="text-lg font-bold uppercase tracking-widest text-gray-400">Experience</h3>
          <div className="h-px flex-1 bg-gray-200"></div>
        </div>
      ),
    });

    experience.forEach((exp) => {
      blocks.push({
        id: `exp-${exp.id}`,
        content: (
          <div className="mb-6 relative pl-8 border-l-2 border-gray-100" style={containerStyle}>
            <div className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full border-2 bg-white" style={{ borderColor: themeColor }}></div>
            <div className="flex justify-between items-start mb-1">
              <h4 className="font-bold text-gray-900 text-lg">{exp.position}</h4>
              <span className="text-xs font-bold px-2 py-1 rounded bg-gray-100 text-gray-600">
                {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
              </span>
            </div>
            <div className="text-sm font-semibold mb-2 uppercase tracking-wide" style={{ color: themeColor }}>
              {exp.company}
            </div>
            <p className="text-gray-600 text-sm leading-relaxed">
              {exp.description}
            </p>
          </div>
        ),
      });
    });
  }

  // Education
  if (education.length > 0) {
    blocks.push({
      id: 'edu-title',
      content: (
        <h3 style={{ color: colors.textMain, fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1rem' }}>
          <span style={{ width: '20px', height: '4px', backgroundColor: themeColor, borderRadius: '2px' }}></span>
          Education
        </h3>
      )
    });

    education.forEach(edu => {
      blocks.push({
        id: `edu-${edu.id}`,
        content: (
          <div style={{ marginBottom: '1.5rem', paddingLeft: '1rem', borderLeft: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.25rem' }}>
              <h4 style={{ color: colors.textMain, fontSize: '1.1rem', fontWeight: 700 }}>{edu.institution}</h4>
              <span style={{ color: colors.textSec, fontSize: '0.85rem', fontWeight: 500 }}>
                {edu.startDate} - {edu.endDate || 'Present'}
              </span>
            </div>
            <div style={{ color: colors.textMain, fontWeight: 500 }}>{edu.degree}</div>
            {edu.description && (
              <p style={{ color: colors.textSec, fontSize: '0.9rem', marginTop: '0.25rem' }}>{edu.description}</p>
            )}
          </div>
        )
      });
    });
  }

  // Skills
  if (skills.length > 0) {
    blocks.push({
      id: 'skills-title',
      content: (
        <div className="mb-6 flex items-center gap-3" style={containerStyle}>
          <div className="h-px flex-1 bg-gray-200"></div>
          <h3 className="text-lg font-bold uppercase tracking-widest text-gray-400">Skills</h3>
          <div className="h-px flex-1 bg-gray-200"></div>
        </div>
      ),
    });

    blocks.push({
      id: 'skills-content',
      content: (
        <div className="mb-8 grid grid-cols-2 gap-4" style={containerStyle}>
          {skills.map(skill => (
            <div key={skill.id} className="flex items-center gap-2">
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-800">{skill.name}</div>
                <div className="flex gap-1 mt-1">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className="h-1.5 w-8 rounded-full"
                      style={{ backgroundColor: i < skill.level ? themeColor : '#e5e7eb' }}
                    />
                  ))}
                </div>
              </div>
            </div>
          ))}
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
