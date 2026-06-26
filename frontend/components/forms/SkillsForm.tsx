import React from "react";
import { useCVStore } from "@/store/useCVStore";
import { Plus, Trash2, GripVertical } from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

/**
 * Sortable row for the compact skills list.
 *
 * Layout differs from EducationForm/ExperienceForm: skill rows are a single
 * horizontal flex line, so the grip handle sits inline as the leftmost cell
 * (not absolute-positioned over a card). Visual is consistent with how the
 * input + level select + delete button already align.
 */
const SortableSkillRow: React.FC<{
  id: string;
  children: React.ReactNode;
}> = ({ id, children }) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2 group"
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-500 p-1"
        aria-label="Drag to reorder"
        type="button"
      >
        <GripVertical size={16} />
      </button>
      {children}
    </div>
  );
};

export const SkillsForm: React.FC = () => {
  const {
    skills,
    addSkill,
    removeSkill,
    updateSkill,
    reorderSkill,
    dataVersion,
  } = useCVStore();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = skills.findIndex((item) => item.id === active.id);
      const newIndex = skills.findIndex((item) => item.id === over.id);
      if (oldIndex >= 0 && newIndex >= 0) {
        reorderSkill(oldIndex, newIndex);
      }
    }
  };

  return (
    <div
      className="space-y-6 p-4 bg-white rounded-lg shadow-sm border border-gray-100"
      key={dataVersion}
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Skills</h2>
        <button
          onClick={addSkill}
          className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-[#DB4B2E] bg-[#FBEAE4] hover:bg-[#FBDDD3] rounded-md transition-colors"
        >
          <Plus size={16} />
          Add Skill
        </button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={skills.map((s) => s.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-3">
            {skills.map((skill) => (
              <SortableSkillRow key={skill.id} id={skill.id}>
                <div className="flex-1">
                  <input
                    value={skill.name}
                    onChange={(e) =>
                      updateSkill(skill.id, { name: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#DB4B2E]/45 focus:border-transparent transition-all"
                    placeholder="Skill (e.g. React, Python)"
                  />
                </div>

                <div className="w-24">
                  <select
                    value={skill.level}
                    onChange={(e) =>
                      updateSkill(skill.id, {
                        level: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#DB4B2E]/45 focus:border-transparent transition-all"
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
                  type="button"
                >
                  <Trash2 size={18} />
                </button>
              </SortableSkillRow>
            ))}

            {skills.length === 0 && (
              <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                No skills added yet.
              </div>
            )}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
};
