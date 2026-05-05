"use client";

import { TemplateId } from "@/types/resume";

interface Props {
  current: TemplateId;
  onChange: (templateId: TemplateId) => void;
}

export default function TemplateSelector({ current, onChange }: Props) {
  return (
    <button
      type="button"
      onClick={() => onChange(current)}
      className="text-sm bg-white border border-gray-200 rounded-xl px-3 py-2 text-gray-700 hover:bg-gray-50 transition"
    >
      Template: {current}
    </button>
  );
}