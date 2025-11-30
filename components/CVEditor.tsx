import React, { useState } from 'react';
import { PersonalForm } from './forms/PersonalForm';
import { EducationForm } from './forms/EducationForm';
import { ExperienceForm } from './forms/ExperienceForm';
import { SkillsForm } from './forms/SkillsForm';
import { User, GraduationCap, Briefcase, Wrench } from 'lucide-react';
import clsx from 'clsx';

type Tab = 'personal' | 'education' | 'experience' | 'skills';

export const CVEditor: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('personal');

  const tabs = [
    { id: 'personal', label: 'Personal', icon: User },
    { id: 'education', label: 'Education', icon: GraduationCap },
    { id: 'experience', label: 'Experience', icon: Briefcase },
    { id: 'skills', label: 'Skills', icon: Wrench },
  ] as const;

  return (
    <div className="flex flex-col bg-white border-r border-gray-200">
      <div className="flex border-b border-gray-200 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={clsx(
                'flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors whitespace-nowrap',
                activeTab === tab.id
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              )}
            >
              <Icon size={18} />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="p-6 bg-gray-50/30">
        <div className="max-w-2xl mx-auto">
          {activeTab === 'personal' && <PersonalForm />}
          {activeTab === 'education' && <EducationForm />}
          {activeTab === 'experience' && <ExperienceForm />}
          {activeTab === 'skills' && <SkillsForm />}
        </div>
      </div>
    </div>
  );
};
