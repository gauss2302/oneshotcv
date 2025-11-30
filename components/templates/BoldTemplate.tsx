import React from 'react';
import { CVState, CVDesignSettings } from '@/types/cv';
import { TemplateBlock } from './types';
import { Mail, Phone, MapPin, GraduationCap } from 'lucide-react';

export const getBoldTemplateBlocks = (data: CVState, settings: CVDesignSettings): TemplateBlock[] => {
  const blocks: TemplateBlock[] = [];
  const { personalInfo, education, experience, skills } = data;
  const { 
    themeColor = '#ec4899', 
    fontFamily = 'sans', 
    scale = 1,
    textAlignment = 'left',
  } = settings;

  const defaultFontSizes = { header: 3, sectionTitle: 1.875, body: 1 };
  const defaultSpacing = { lineHeight: 1.6, sectionPadding: 2.5, itemGap: 1.5 };
  
  const fontSizes = { ...defaultFontSizes, ...settings.fontSizes };
  const spacing = { ...defaultSpacing, ...settings.spacing };

  const fontStyle = fontFamily === 'serif' ? 'Georgia, serif' : 
                    fontFamily === 'mono' ? 'Courier New, monospace' : 
                    fontFamily === 'times' ? '"Times New Roman", Times, serif' : 
                    'ui-sans-serif, system-ui, sans-serif';
                    
  const baseStyle = { 
    fontFamily: fontStyle, 
    lineHeight: spacing.lineHeight,
    textAlign: textAlignment
  };

  // Helper to create a block
  const addBlock = (id: string, content: React.ReactNode) => {
    blocks.push({ id, content });
  };

  // Header (Bold, colored background)
  addBlock('header', (
    <div style={{ ...baseStyle, textAlign: 'center', marginBottom: `${spacing.sectionPadding}rem`, padding: '2rem', borderRadius: '1rem', backgroundColor: themeColor, color: 'white' }}>
      <h1 style={{ fontSize: `${fontSizes.header * scale}rem`, fontWeight: '900', marginBottom: '0.5rem', letterSpacing: '-0.025em', lineHeight: 1.1 }}>
        {personalInfo.fullName || 'YOUR NAME'}
      </h1>
      <p style={{ fontSize: `${1.25 * scale}rem`, opacity: 0.9, fontWeight: '300', letterSpacing: '0.025em', marginBottom: '1.5rem' }}>
        {personalInfo.title || 'CREATIVE PROFESSIONAL'}
      </p>
      
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '1.5rem', fontSize: `${0.875 * scale}rem`, opacity: 0.9 }}>
        {personalInfo.email && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Mail size={16 * scale} />
            <span>{personalInfo.email}</span>
          </div>
        )}
        {personalInfo.phone && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Phone size={16 * scale} />
            <span>{personalInfo.phone}</span>
          </div>
        )}
        {personalInfo.location && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <MapPin size={16 * scale} />
            <span>{personalInfo.location}</span>
          </div>
        )}
      </div>
    </div>
  ));

  // Summary
  if (personalInfo.summary) {
    addBlock('summary', (
      <div style={{ ...baseStyle, textAlign: 'center', maxWidth: '42rem', margin: `0 auto ${spacing.sectionPadding}rem auto` }}>
        <div style={{ width: '4rem', height: '0.25rem', margin: '0 auto 1rem auto', borderRadius: '9999px', backgroundColor: themeColor }}></div>
        <p style={{ fontSize: `${1.125 * scale}rem`, color: '#374151', lineHeight: 1.7 }}>{personalInfo.summary}</p>
      </div>
    ));
  }

  // Skills Pills (Centered)
  if (skills.length > 0) {
    addBlock('skills-section', (
      <div style={{ ...baseStyle, marginBottom: `${spacing.sectionPadding}rem`, padding: '1.5rem', borderRadius: '1rem', backgroundColor: '#f9fafb' }}>
        <h2 style={{ fontSize: `${fontSizes.sectionTitle * scale}rem`, fontWeight: '900', textAlign: 'center', marginBottom: '1.5rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: themeColor }}>
          Skills
        </h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0.75rem' }}>
          {skills.map((skill) => (
            <div
              key={skill.id}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: 'white',
                borderRadius: '9999px',
                fontSize: `${0.875 * scale}rem`,
                fontWeight: '600',
                color: themeColor,
                border: `2px solid ${themeColor}`,
                boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
              }}
            >
              {skill.name}
            </div>
          ))}
        </div>
      </div>
    ));
  }

  // Experience
  if (experience.length > 0) {
    addBlock('experience-title', (
      <h2 style={{ ...baseStyle, fontSize: `${fontSizes.sectionTitle * scale}rem`, fontWeight: '900', textAlign: 'center', marginBottom: '1.5rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: themeColor }}>
        Experience
      </h2>
    ));

    experience.forEach((exp) => {
      addBlock(`exp-${exp.id}`, (
        <div style={{ ...baseStyle, marginBottom: `${spacing.itemGap}rem`, padding: '1.5rem', borderRadius: '0.75rem', borderLeft: `4px solid ${themeColor}`, backgroundColor: '#f9fafb' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem', flexDirection: textAlignment === 'right' ? 'row-reverse' : 'row' }}>
            <div>
              <h3 style={{ fontSize: `${1.25 * scale}rem`, fontWeight: 'bold', color: '#111827' }}>{exp.position}</h3>
              <p style={{ fontWeight: '600', color: themeColor }}>{exp.company}</p>
            </div>
            <span style={{ fontSize: `${0.875 * scale}rem`, color: '#6b7280', backgroundColor: 'white', padding: '0.25rem 0.75rem', borderRadius: '9999px' }}>
              {exp.startDate} - {exp.endDate || 'Present'}
            </span>
          </div>
          <p style={{ color: '#374151', fontSize: `${fontSizes.body * scale}rem` }}>{exp.description}</p>
        </div>
      ));
    });
  }

  // Education
  if (education.length > 0) {
    addBlock('education-title', (
      <h2 style={{ ...baseStyle, fontSize: `${fontSizes.sectionTitle * scale}rem`, fontWeight: '900', textAlign: 'center', marginBottom: '1.5rem', marginTop: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: themeColor }}>
        Education
      </h2>
    ));

    // Grid layout for education if possible, but blocks are linear. We'll stack them nicely.
    education.forEach((edu) => {
      addBlock(`edu-${edu.id}`, (
        <div style={{ ...baseStyle, marginBottom: '1rem', padding: '1.25rem', borderRadius: '0.75rem', backgroundColor: '#f9fafb', border: `2px solid ${themeColor}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', justifyContent: textAlignment === 'right' ? 'flex-end' : 'flex-start' }}>
            <GraduationCap size={24 * scale} color={themeColor} />
            <h3 style={{ fontSize: `${1.125 * scale}rem`, fontWeight: 'bold', color: '#111827' }}>{edu.degree}</h3>
          </div>
          <p style={{ color: '#4b5563', fontSize: `${fontSizes.body * scale}rem` }}>{edu.institution}</p>
          <p style={{ fontSize: `${0.875 * scale}rem`, color: '#6b7280' }}>{edu.endDate}</p>
        </div>
      ));
    });
  }

  // Footer
  addBlock('footer', (
    <div style={{ ...baseStyle, marginTop: '2rem', textAlign: 'center', fontSize: '0.75rem', color: '#9ca3af' }}>
      Built by <span style={{ fontWeight: 'bold', color: themeColor }}>oneshotcv.art</span> with love
    </div>
  ));

  return blocks;
};
