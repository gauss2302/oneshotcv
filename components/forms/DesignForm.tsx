import React from 'react';
import { useCVStore } from '@/store/useCVStore';
import { Palette, Type, Scaling, AlignLeft, AlignCenter, AlignRight, AlignJustify, Layout, MoveVertical } from 'lucide-react';

const colors = [
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Green', value: '#10b981' },
  { name: 'Purple', value: '#8b5cf6' },
  { name: 'Red', value: '#ef4444' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Slate', value: '#475569' },
  { name: 'Black', value: '#000000' },
];

const fonts = [
  { id: 'sans', name: 'Sans Serif', style: 'font-sans' },
  { id: 'serif', name: 'Serif', style: 'font-serif' },
  { id: 'mono', name: 'Monospace', style: 'font-mono' },
  { id: 'times', name: 'Times New Roman', style: 'font-serif' },
];

export const DesignForm: React.FC = () => {
  const { designSettings, updateDesign } = useCVStore();

  const defaultFontSizes = { header: 2.25, sectionTitle: 1.5, body: 1 };
  const defaultSpacing = { lineHeight: 1.6, sectionPadding: 2, itemGap: 1 };

  // Helper to safely update nested settings
  const updateFontSize = (key: keyof typeof defaultFontSizes, value: number) => {
    updateDesign({
      fontSizes: {
        ...defaultFontSizes,
        ...designSettings.fontSizes,
        [key]: value,
      },
    });
  };

  const updateSpacing = (key: keyof typeof defaultSpacing, value: number) => {
    updateDesign({
      spacing: {
        ...defaultSpacing,
        ...designSettings.spacing,
        [key]: value,
      },
    });
  };

  return (
    <div className="space-y-8">
      {/* Theme Color */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-lg font-semibold text-gray-900">
          <Palette size={20} className="text-blue-600" />
          <h3>Theme Color</h3>
        </div>
        
        <div className="grid grid-cols-4 gap-3">
          {colors.map((color) => (
            <button
              key={color.value}
              onClick={() => updateDesign({ themeColor: color.value })}
              className={`
                w-full aspect-square rounded-lg border-2 flex items-center justify-center transition-all
                ${designSettings.themeColor === color.value ? 'border-blue-600 scale-110 shadow-md' : 'border-transparent hover:scale-105'}
              `}
              style={{ backgroundColor: color.value }}
              title={color.name}
            >
              {designSettings.themeColor === color.value && (
                <div className="w-2 h-2 bg-white rounded-full" />
              )}
            </button>
          ))}
          
          {/* Custom Color Input */}
          <div className="relative w-full aspect-square rounded-lg border-2 border-gray-200 overflow-hidden flex items-center justify-center bg-gray-100">
             <input 
               type="color" 
               value={designSettings.themeColor}
               onChange={(e) => updateDesign({ themeColor: e.target.value })}
               className="absolute inset-0 w-[150%] h-[150%] -top-[25%] -left-[25%] cursor-pointer opacity-0"
             />
             <span className="text-xs font-medium text-gray-500">Custom</span>
          </div>
        </div>
      </div>

      {/* Typography */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-lg font-semibold text-gray-900">
          <Type size={20} className="text-blue-600" />
          <h3>Typography</h3>
        </div>
        
        <div className="grid grid-cols-1 gap-3">
          {fonts.map((font) => (
            <button
              key={font.id}
              onClick={() => updateDesign({ fontFamily: font.id as any })}
              className={`
                px-4 py-3 rounded-lg border-2 text-left transition-all
                ${designSettings.fontFamily === font.id 
                  ? 'border-blue-600 bg-blue-50 text-blue-700' 
                  : 'border-gray-200 hover:border-gray-300 text-gray-700'}
                ${font.id === 'times' ? 'font-serif' : font.style}
              `}
              style={font.id === 'times' ? { fontFamily: '"Times New Roman", Times, serif' } : {}}
            >
              <span className="text-lg">{font.name}</span>
              <p className="text-sm opacity-70 mt-1">The quick brown fox jumps over the lazy dog.</p>
            </button>
          ))}
        </div>
      </div>

      {/* Text Alignment */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-lg font-semibold text-gray-900">
          <Layout size={20} className="text-blue-600" />
          <h3>Alignment</h3>
        </div>
        <div className="flex bg-gray-100 p-1 rounded-lg">
          {[
            { id: 'left', icon: AlignLeft },
            { id: 'center', icon: AlignCenter },
            { id: 'right', icon: AlignRight },
            { id: 'justify', icon: AlignJustify },
          ].map((align) => (
            <button
              key={align.id}
              onClick={() => updateDesign({ textAlignment: align.id as any })}
              className={`flex-1 p-2 rounded-md flex justify-center transition-all ${
                designSettings.textAlignment === align.id ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <align.icon size={20} />
            </button>
          ))}
        </div>
      </div>

      {/* Font Sizes */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-lg font-semibold text-gray-900">
          <Scaling size={20} className="text-blue-600" />
          <h3>Font Sizes</h3>
        </div>
        
        <div className="space-y-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Header Name</label>
            <input
              type="range"
              min="1.5"
              max="4"
              step="0.1"
              value={designSettings.fontSizes?.header || 2.25}
              onChange={(e) => updateFontSize('header', parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Section Titles</label>
            <input
              type="range"
              min="1"
              max="2.5"
              step="0.1"
              value={designSettings.fontSizes?.sectionTitle || 1.5}
              onChange={(e) => updateFontSize('sectionTitle', parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Body Text</label>
            <input
              type="range"
              min="0.7"
              max="1.3"
              step="0.05"
              value={designSettings.fontSizes?.body || 1}
              onChange={(e) => updateFontSize('body', parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>
        </div>
      </div>

      {/* Spacing */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-lg font-semibold text-gray-900">
          <MoveVertical size={20} className="text-blue-600" />
          <h3>Spacing</h3>
        </div>
        
        <div className="space-y-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Line Height</label>
            <input
              type="range"
              min="1"
              max="2"
              step="0.1"
              value={designSettings.spacing?.lineHeight || 1.6}
              onChange={(e) => updateSpacing('lineHeight', parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Section Padding</label>
            <input
              type="range"
              min="0.5"
              max="4"
              step="0.25"
              value={designSettings.spacing?.sectionPadding || 2}
              onChange={(e) => updateSpacing('sectionPadding', parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Item Gap</label>
            <input
              type="range"
              min="0.5"
              max="3"
              step="0.25"
              value={designSettings.spacing?.itemGap || 1}
              onChange={(e) => updateSpacing('itemGap', parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>
        </div>
      </div>

      {/* Global Scale (Legacy support) */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-lg font-semibold text-gray-900">
          <Scaling size={20} className="text-blue-600" />
          <h3>Global Scale</h3>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <input
            type="range"
            min="0.7"
            max="1.3"
            step="0.05"
            value={designSettings.scale}
            onChange={(e) => updateDesign({ scale: parseFloat(e.target.value) })}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
          <div className="mt-2 text-center text-sm font-medium text-gray-700">
            {Math.round(designSettings.scale * 100)}%
          </div>
        </div>
      </div>
    </div>
  );
};
