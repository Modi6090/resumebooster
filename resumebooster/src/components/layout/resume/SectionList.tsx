// src/components/resume/SectionList.tsx
"use client";

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,   
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { KeyboardSensor } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { ResumeContent, ResumeSection } from "@/types/resume";
import HeaderForm from "./sections/HeaderForm";
import SummaryForm from "./sections/SummaryForm";
import ExperienceForm from "./sections/ExperienceForm";
import EducationForm from "./sections/EducationForm";
import SkillsForm from "./sections/SkillsForm";
import ProjectsForm from "./sections/ProjectsForm";

interface Props {
  content: ResumeContent;
  onChange: (content: ResumeContent) => void;
  activeSection: string | null;
  onActiveSection: (id: string | null) => void;
}

export function SectionList({ content, onChange, activeSection, onActiveSection }: Props) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = content.sections.findIndex((s) => s.id === active.id);
    const newIndex = content.sections.findIndex((s) => s.id === over.id);
    onChange({ ...content, sections: arrayMove(content.sections, oldIndex, newIndex) });
  }

  function updateSection(sectionId: string, newData: any) {
    onChange({
      ...content,
      sections: content.sections.map((s) =>
        s.id === sectionId ? { ...s, data: newData } : s
      ),
    });
  }

  function toggleVisibility(sectionId: string) {
    onChange({
      ...content,
      sections: content.sections.map((s) =>
        s.id === sectionId ? { ...s, visible: !s.visible } : s
      ),
    });
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext
        items={content.sections.map((s) => s.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="divide-y divide-gray-100">
          {content.sections.map((section) => (
            <SortableSection
              key={section.id}
              section={section}
              isActive={activeSection === section.id}
              onToggle={() => onActiveSection(activeSection === section.id ? null : section.id)}
              onVisibilityToggle={() => toggleVisibility(section.id)}
              onDataChange={(data) => updateSection(section.id, data)}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}

interface SortableSectionProps {
  section: ResumeSection;
  isActive: boolean;
  onToggle: () => void;
  onVisibilityToggle: () => void;
  onDataChange: (data: any) => void;
}

function SortableSection({
  section,
  isActive,
  onToggle,
  onVisibilityToggle,
  onDataChange,
}: SortableSectionProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      {/* Section header row */}
      <div
        className={`flex items-center gap-2 px-4 py-3 cursor-pointer select-none hover:bg-gray-50 transition-colors ${
          isActive ? "bg-emerald-50" : ""
        }`}
        onClick={onToggle}
      >
        {/* Drag handle */}
        <span
          {...attributes}
          {...listeners}
          className="text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing"
          onClick={(e) => e.stopPropagation()}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="9" cy="7" r="1.5"/><circle cx="15" cy="7" r="1.5"/>
            <circle cx="9" cy="12" r="1.5"/><circle cx="15" cy="12" r="1.5"/>
            <circle cx="9" cy="17" r="1.5"/><circle cx="15" cy="17" r="1.5"/>
          </svg>
        </span>

        <span className="flex-1 text-sm font-medium text-gray-800">{section.label}</span>

        {/* Visibility toggle */}
        <button
          onClick={(e) => { e.stopPropagation(); onVisibilityToggle(); }}
          className={`transition-colors ${section.visible ? "text-gray-400 hover:text-gray-600" : "text-gray-200 hover:text-gray-400"}`}
          title={section.visible ? "Hide section" : "Show section"}
        >
          {section.visible ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
              <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
              <line x1="1" y1="1" x2="23" y2="23"/>
            </svg>
          )}
        </button>

        {/* Expand chevron */}
        <svg
          width="14" height="14" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          className={`text-gray-400 transition-transform ${isActive ? "rotate-180" : ""}`}
        >
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </div>

      {/* Section form */}
      {isActive && (
        <div className="px-4 pb-4 bg-gray-50 border-t border-gray-100">
          <SectionForm
            section={section}
            onDataChange={onDataChange}
          />
        </div>
      )}
    </div>
  );
}

function SectionForm({ section, onDataChange }: { section: ResumeSection; onDataChange: (d: any) => void }) {
  switch (section.type) {
    case "header":     return <HeaderForm data={section.data as any} onChange={onDataChange} />;
    case "summary":    return <SummaryForm data={section.data as any} onChange={onDataChange} />;
    case "experience": return <ExperienceForm data={section.data as any} onChange={onDataChange} />;
    case "education":  return <EducationForm data={section.data as any} onChange={onDataChange} />;
    case "skills":     return <SkillsForm data={section.data as any} onChange={onDataChange} />;
    case "projects":   return <ProjectsForm data={section.data as any} onChange={onDataChange} />;
    default:           return <p className="text-xs text-gray-400 pt-3">No editor for this section yet.</p>;
  }
}