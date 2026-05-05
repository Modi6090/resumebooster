// src/components/resume/ResumeEditor.tsx
"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { ResumeContent, TemplateId } from "@/types/resume";
import { SectionList } from "./SectionList";
import { ResumePreview } from "./ResumePreview";

interface TemplateSelectorProps {
  current: TemplateId;
  onChange: (templateId: TemplateId) => void;
}

export default function TemplateSelector({ current, onChange }: TemplateSelectorProps) {
  return (
    <button
      type="button"
      onClick={() => onChange(current)}
      className="text-sm bg-white border border-gray-200 rounded-xl px-3 py-2 text-gray-700 hover:bg-gray-50 transition"
    >
      Template: {current}
    </button>
  );
};

interface Props {
  resumeId: string;
  initialTitle: string;
  initialContent: ResumeContent;
}

type SaveState = "saved" | "saving" | "unsaved" | "error";

export function ResumeEditor({ resumeId, initialTitle, initialContent }: Props) {
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState<ResumeContent>(initialContent);
  const [saveState, setSaveState] = useState<SaveState>("saved");
  const [exporting, setExporting] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const save = useCallback(
    async (titleToSave: string, contentToSave: ResumeContent) => {
      setSaveState("saving");
      try {
        const res = await fetch(`/api/resumes/${resumeId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: titleToSave, content: contentToSave }),
        });
        setSaveState(res.ok ? "saved" : "error");
      } catch {
        setSaveState("error");
      }
    },
    [resumeId]
  );

  const scheduleSave = useCallback(
    (newTitle: string, newContent: ResumeContent) => {
      setSaveState("unsaved");
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => save(newTitle, newContent), 1500);
    },
    [save]
  );

  useEffect(() => {
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, []);

  function handleContentChange(newContent: ResumeContent) {
    setContent(newContent);
    scheduleSave(title, newContent);
  }

  function handleTitleChange(newTitle: string) {
    setTitle(newTitle);
    scheduleSave(newTitle, content);
  }

  function handleTemplateChange(templateId: TemplateId) {
    const newContent = { ...content, templateId };
    setContent(newContent);
    scheduleSave(title, newContent);
  }

  async function handleExport() {
    setExporting(true);
    try {
      await save(title, content);
      const res = await fetch(`/api/export/${resumeId}`);
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${title.replace(/[^a-z0-9]/gi, "_")}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert("Export failed. Please try again.");
    } finally {
      setExporting(false);
    }
  }

  const saveLabel = {
    saved: "Saved",
    saving: "Saving…",
    unsaved: "Unsaved changes",
    error: "Save failed",
  }[saveState];

  const saveColor = {
    saved: "text-emerald-600",
    saving: "text-gray-400",
    unsaved: "text-amber-500",
    error: "text-red-500",
  }[saveState];

  return (
    <div className="flex flex-col h-screen -m-8 overflow-hidden">
      <div className="flex items-center justify-between px-6 py-3 bg-white border-b border-gray-200 shrink-0 z-10">
        <div className="flex items-center gap-4">
          <a href="/dashboard" className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </a>
          <input
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            className="text-sm font-medium text-gray-900 bg-transparent border-none outline-none focus:bg-gray-50 focus:px-2 focus:py-0.5 focus:rounded-md transition-all min-w-0 w-48"
            placeholder="Resume title"
          />
          <span className={`text-xs ${saveColor} transition-colors`}>{saveLabel}</span>
        </div>

        <div className="flex items-center gap-3">
          <TemplateSelector current={content.templateId} onChange={handleTemplateChange} />
          <button
            onClick={handleExport}
            disabled={exporting}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] disabled:opacity-60 text-white text-sm font-medium px-4 py-2 rounded-xl transition-all"
          >
            {exporting ? (
              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
            )}
            {exporting ? "Generating…" : "Export PDF"}
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="w-[420px] shrink-0 bg-white border-r border-gray-200 overflow-y-auto">
          <SectionList
            content={content}
            onChange={handleContentChange}
            activeSection={activeSection}
            onActiveSection={setActiveSection}
          />
        </div>

        <div className="flex-1 bg-gray-100 overflow-auto flex items-start justify-center p-8">
          <ResumePreview content={content} />
        </div>
      </div>
    </div>
  );
}