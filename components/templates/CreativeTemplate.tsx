import React from 'react';
import { CVState, CVDesignSettings } from '@/types/cv';
import { TemplateBlock, TemplateGenerator } from './types';
import { Mail, Phone, MapPin } from 'lucide-react';

const colors = {
  headerBg: '#2c3e50', // dark blue
  headerText: '#ffffff',
  mainText: '#2c3e50',
  secText: '#7f8c8d',
  accent: '#e74c3c', // red
};

export const getCreativeTemplateBlocks: TemplateGenerator = (data: CVState, settings: CVDesignSettings) => {
  const { personalInfo, education, experience, skills } = data;
  const { themeColor, fontFamily, scale } = settings;
  const blocks: TemplateBlock[] = [];

  const containerStyle = {
    fontFamily: fontFamily === 'serif' ? 'Georgia, serif' : fontFamily === 'mono' ? 'Courier New, monospace' : 'ui-sans-serif, system-ui, sans-serif',
    fontSize: `${0.9 * scale}rem`,
    lineHeight: 1.6,
    color: '#2c3e50',
  };

  // Creative Template: Bold header block, centered content, elegant typography
  
  // Header Block (Full width background simulation)
  blocks.push({
    id: 'header',
    content: (
      <div className="-mx-8 -mt-8 mb-8 p-8 text-white text-center" style={{ backgroundColor: '#1f2937', fontFamily: containerStyle.fontFamily }}>
        {personalInfo.photo && (
          <div className="mb-6 flex justify-center">
            <img
              src={personalInfo.photo.url}
              alt={personalInfo.fullName}
              className="w-48 h-48 rounded-full object-cover border-4"
              style={{ borderColor: themeColor }}
            />
          </div>
        )}
        <h1 className="text-4xl font-black tracking-wider mb-2 uppercase" style={{ color: themeColor }}>
          {personalInfo.fullName || 'YOUR NAME'}
        </h1>
        <p className="text-lg font-light tracking-widest opacity-90 mb-6">{personalInfo.title || 'CREATIVE PROFESSIONAL'}</p>
        
        <div className="flex flex-wrap justify-center gap-6 text-sm opacity-80">
          {personalInfo.email && (
            <div className="flex items-center gap-2">
              <Mail size={14} />
              <span>{personalInfo.email}</span>
            </div>
          )}
          {personalInfo.phone && (
            <div className="flex items-center gap-2">
              <Phone size={14} />
              <span>{personalInfo.phone}</span>
            </div>
          )}
          {personalInfo.address && (
            <div className="flex items-center gap-2">
              <MapPin size={14} />
              <span>{personalInfo.address}</span>
            </div>
          )}
        </div>
      </div>
    ),
  });

  // 2. Summary Block (Centered)
  if (personalInfo.summary) {
    blocks.push({
      id: 'summary',
      content: (
        <div className="mb-8 text-center max-w-lg mx-auto" style={containerStyle}>
           <div className="w-12 h-1 mx-auto mb-4" style={{ backgroundColor: themeColor }}></div>
          <p className="text-gray-700 leading-relaxed">
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
        <div className="mb-6 text-center" style={containerStyle}>
          <h3 style={{ color: '#2c3e50', fontSize: '1.5rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '1rem' }}>
            Experience
          </h3>
          <div className="w-8 h-1 mx-auto bg-gray-200"></div>
        </div>
      ),
    });

    experience.forEach((exp) => {
      blocks.push({
        id: `exp-${exp.id}`,
        content: (
          <div className="mb-8 text-center max-w-2xl mx-auto" style={containerStyle}>
            <h4 className="font-bold text-xl mb-1" style={{ color: themeColor }}>{exp.position}</h4>
            <div className="text-gray-500 font-medium mb-2 uppercase tracking-wide text-sm">
              {exp.company} | {exp.startDate} – {exp.current ? 'Present' : exp.endDate}
            </div>
            <p className="text-gray-600 leading-relaxed">
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
        <div className="mb-6 text-center" style={containerStyle}>
          <h3 style={{ color: '#2c3e50', fontSize: '1.5rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '1rem' }}>
            Education
          </h3>
          <div className="w-8 h-1 mx-auto bg-gray-200"></div>
        </div>
      ),
    });

    education.forEach((edu) => {
      blocks.push({
        id: `edu-${edu.id}`,
        content: (
          <div className="mb-6 text-center" style={containerStyle}>
            <h4 className="font-bold text-lg" style={{ color: themeColor }}>{edu.institution}</h4>
            <div className="text-gray-800 font-medium">{edu.degree}</div>
            <div className="text-sm text-gray-500 mt-1">
              {edu.startDate} – {edu.current ? 'Present' : edu.endDate}
            </div>
            {edu.description && <p className="text-sm mt-2 text-gray-600 max-w-lg mx-auto">{edu.description}</p>}
          </div>
        ),
      });
    });
  }

  // Skills
  if (skills.length > 0) {
    blocks.push({
      id: 'skills',
      content: (
        <section style={{ marginTop: '3rem', backgroundColor: '#ecf0f1', padding: '2rem', borderRadius: '1rem' }}>
          <h3 style={{ color: '#2c3e50', fontSize: '1.25rem', fontWeight: 800, textAlign: 'center', textTransform: 'uppercase', marginBottom: '1.5rem' }}>
            Skills
          </h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '1rem' }}>
            {skills.map((skill) => (
              <div
                key={skill.id}
                style={{ 
                  backgroundColor: '#ffffff', 
                  color: themeColor, 
                  padding: '0.5rem 1rem', 
                  borderRadius: '0.5rem', 
                  fontSize: '0.9rem', 
                  fontWeight: 600,
                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                }}
              >
                {skill.name}
              </div>
            ))}
          </div>
        </section>
      )
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
