import React from 'react';
import { useCVStore } from '@/store/useCVStore';
import { Plus, Trash2 } from 'lucide-react';

export const SkillsForm: React.FC = () => {
  const { skills, addSkill, removeSkill, updateSkill } = useCVStore();

  return (
    <div className="space-y-6 p-4 bg-white rounded-lg shadow-sm border border-gray-100">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Skills</h2>
        <button
          onClick={addSkill}
          className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
        >
          <Plus size={16} />
          Add Skill
        </button>
      </div>

      <div className="space-y-3">
        {skills.map((skill) => (
          <div key={skill.id} className="flex items-center gap-3 group">
            <div className="flex-1">
              <input
                value={skill.name}
                onChange={(e) => updateSkill(skill.id, { name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Skill (e.g. React, Python)"
              />
            </div>
            
            <div className="w-24">
              <select
                value={skill.level}
                onChange={(e) => updateSkill(skill.id, { level: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value={1}>Beginner</option>
                <option value={2}>Basic</option>
                <option value={3}>Intermediate</option>
                <option value={4}>Advanced</option>
                <option value={5}>Expert</option>
              </select>
            </div>

            <button
              onClick={() => removeSkill(skill.id)}
              className="text-gray-400 hover:text-red-500 transition-colors p-2"
              title="Remove"
            >
              <Trash2 size={18} />
            </button>
          </div>
        ))}

        {skills.length === 0 && (
          <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300">
            No skills added yet.
          </div>
        )}
      </div>
    </div>
  );
};
