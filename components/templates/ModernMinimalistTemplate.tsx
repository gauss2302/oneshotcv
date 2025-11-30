import React from 'react';
import { CVState, CVDesignSettings } from '@/types/cv';
import { TemplateBlock } from './types';
import { Mail, Phone, MapPin } from 'lucide-react';

export const getModernMinimalistTemplateBlocks = (data: CVState, settings: CVDesignSettings): TemplateBlock[] => {
  const blocks: TemplateBlock[] = [];
  const { personalInfo, education, experience, skills } = data;
  const { 
    themeColor = '#3b82f6', 
    fontFamily = 'sans', 
    scale = 1,
    textAlignment = 'left',
  } = settings;

  const defaultFontSizes = { header: 2.25, sectionTitle: 1.5, body: 1 };
  const defaultSpacing = { lineHeight: 1.6, sectionPadding: 2, itemGap: 1 };

  const fontSizes = { ...defaultFontSizes, ...settings.fontSizes };
  const spacing = { ...defaultSpacing, ...settings.spacing };

  const fontStyle = fontFamily === 'serif' ? 'Georgia, serif' : 
                    fontFamily === 'mono' ? 'Courier New, monospace' : 
                    fontFamily === 'times' ? '"Times New Roman", Times, serif' : 
                    'ui-sans-serif, system-ui, sans-serif';
                    
  const baseStyle = { 
    fontFamily: fontStyle, 
    color: '#1f2937', 
    lineHeight: spacing.lineHeight,
    textAlign: textAlignment
  };

  // Helper to create a block
  const addBlock = (id: string, content: React.ReactNode) => {
    blocks.push({ id, content });
  };

  // Header
  addBlock('header', (
    <div style={{ ...baseStyle, marginBottom: `${spacing.sectionPadding}rem` }}>
      <h1 style={{ fontSize: `${fontSizes.header * scale}rem`, fontWeight: 'bold', color: themeColor, marginBottom: '0.25rem', lineHeight: 1.2 }}>
        {personalInfo.fullName || 'Your Name'}
      </h1>
      <p style={{ fontSize: `${1.25 * scale}rem`, color: '#4b5563', marginBottom: '1rem' }}>
        {personalInfo.title || 'Professional Title'}
      </p>
      
      <div style={{ 
        display: 'flex', 
        flexWrap: 'wrap', 
        gap: '1rem', 
        fontSize: `${0.875 * scale}rem`, 
        color: '#4b5563',
        justifyContent: textAlignment === 'center' ? 'center' : textAlignment === 'right' ? 'flex-end' : 'flex-start'
      }}>
        {personalInfo.email && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <Mail size={14 * scale} />
            <span>{personalInfo.email}</span>
          </div>
        )}
        {personalInfo.phone && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <Phone size={14 * scale} />
            <span>{personalInfo.phone}</span>
          </div>
        )}
        {personalInfo.location && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <MapPin size={14 * scale} />
            <span>{personalInfo.location}</span>
          </div>
        )}
      </div>
    </div>
  ));

  // Summary
  if (personalInfo.summary) {
    addBlock('summary', (
      <div style={{ ...baseStyle, marginBottom: `${spacing.sectionPadding}rem` }}>
        <div style={{ 
          height: '2px', 
          width: '4rem', 
          backgroundColor: themeColor, 
          marginBottom: '0.75rem',
          marginLeft: textAlignment === 'center' ? 'auto' : textAlignment === 'right' ? 'auto' : '0',
          marginRight: textAlignment === 'center' ? 'auto' : '0'
        }}></div>
        <p style={{ fontSize: `${fontSizes.body * scale}rem`, color: '#374151' }}>{personalInfo.summary}</p>
      </div>
    ));
  }

  // Experience
  if (experience.length > 0) {
    addBlock('experience-title', (
      <h2 style={{ ...baseStyle, fontSize: `${fontSizes.sectionTitle * scale}rem`, fontWeight: 'bold', color: themeColor, marginBottom: '1rem' }}>
        Experience
      </h2>
    ));

    experience.forEach((exp) => {
      addBlock(`exp-${exp.id}`, (
        <div style={{ ...baseStyle, marginBottom: `${spacing.itemGap}rem` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.25rem', flexDirection: textAlignment === 'right' ? 'row-reverse' : 'row' }}>
            <h3 style={{ fontSize: `${1.125 * scale}rem`, fontWeight: '600' }}>{exp.position}</h3>
            <span style={{ fontSize: `${0.875 * scale}rem`, color: '#6b7280' }}>
              {exp.startDate} - {exp.endDate || 'Present'}
            </span>
          </div>
          <p style={{ color: '#4b5563', marginBottom: '0.5rem', fontSize: `${fontSizes.body * scale}rem` }}>{exp.company}</p>
          <p style={{ color: '#374151', fontSize: `${0.875 * scale}rem` }}>{exp.description}</p>
        </div>
      ));
    });
  }

  // Education
  if (education.length > 0) {
    addBlock('education-title', (
      <h2 style={{ ...baseStyle, fontSize: `${fontSizes.sectionTitle * scale}rem`, fontWeight: 'bold', color: themeColor, marginBottom: '1rem' }}>
        Education
      </h2>
    ));

    education.forEach((edu) => {
      addBlock(`edu-${edu.id}`, (
        <div style={{ ...baseStyle, marginBottom: `${spacing.itemGap}rem` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.25rem', flexDirection: textAlignment === 'right' ? 'row-reverse' : 'row' }}>
            <h3 style={{ fontSize: `${1.125 * scale}rem`, fontWeight: '600' }}>{edu.degree}</h3>
            <span style={{ fontSize: `${0.875 * scale}rem`, color: '#6b7280' }}>{edu.endDate}</span>
          </div>
          <p style={{ color: '#4b5563', fontSize: `${fontSizes.body * scale}rem` }}>{edu.institution}</p>
        </div>
      ));
    });
  }

  // Skills
  if (skills.length > 0) {
    addBlock('skills-section', (
      <div style={{ ...baseStyle }}>
        <h2 style={{ fontSize: `${fontSizes.sectionTitle * scale}rem`, fontWeight: 'bold', color: themeColor, marginBottom: '1rem' }}>
          Skills
        </h2>
        <div style={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: '0.5rem',
          justifyContent: textAlignment === 'center' ? 'center' : textAlignment === 'right' ? 'flex-end' : 'flex-start'
        }}>
          {skills.map((skill) => (
            <span
              key={skill.id}
              style={{
                padding: '0.25rem 0.75rem',
                backgroundColor: '#f3f4f6',
                color: '#374151',
                borderRadius: '9999px',
                fontSize: `${0.875 * scale}rem`,
              }}
            >
              {skill.name}
            </span>
          ))}
        </div>
      </div>
    ));
  }

  // Footer
  addBlock('footer', (
    <div style={{ ...baseStyle, marginTop: '2rem', textAlign: 'center', fontSize: '0.75rem', color: '#9ca3af' }}>
      Built by <span style={{ fontWeight: 'bold', color: themeColor }}>oneshotcv.art</span> with love
    </div>
  ));

  return blocks;
};
