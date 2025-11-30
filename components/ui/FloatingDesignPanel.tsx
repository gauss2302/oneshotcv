import React, { useState, useEffect, useRef } from 'react';
import { DesignForm } from '../forms/DesignForm';
import { Palette, X } from 'lucide-react';

export const FloatingDesignPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        const target = event.target as HTMLElement;
        // Don't close if clicking the floating button
        if (!target.closest('[data-design-button]')) {
          setIsOpen(false);
        }
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  return (
    <>
      {/* Floating Button - Bottom Right */}
      <button
        data-design-button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-40 bg-gradient-to-r from-[#FFA239] to-[#FF5656] hover:from-[#FF5656] hover:to-[#FFA239] text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110"
        title="Design Tools"
      >
        <Palette size={24} />
      </button>

      {/* Side Panel - Slides in from right */}
      <div
        ref={panelRef}
        className={`fixed top-0 right-0 h-full w-full sm:w-96 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#FFA239] to-[#FF5656] p-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-white">
            <Palette size={20} />
            <h2 className="text-lg font-bold">Design Tools</h2>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1.5 hover:bg-white/20 rounded-full transition-colors text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto h-[calc(100%-64px)]">
          <DesignForm />
        </div>
      </div>

      {/* Backdrop - semi-transparent, doesn't block interaction */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-40 pointer-events-none"
        />
      )}
    </>
  );
};
