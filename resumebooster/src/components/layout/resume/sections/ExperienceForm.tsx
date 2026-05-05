// src/components/resume/sections/ExperienceForm.tsx
// Replaces the Phase 2 version — adds the AI Bullet Generator toggle per experience item.

"use client";

import { useState } from "react";
import { ExperienceItem } from "@/types/resume";
import { AddButton, DeleteButton, FormField, FormRow, Input, Textarea, nanoid } from "./FormPrimitives";
import { AIBulletGenerator } from "./AIBulletGenerator";

export function ExperienceForm({
  data,
  onChange,
}: {
  data: ExperienceItem[];
  onChange: (d: ExperienceItem[]) => void;
}) {
  // Track which experience item has the AI panel open
  const [aiOpenFor, setAiOpenFor] = useState<string | null>(null);

  function addItem() {
    onChange([
      ...data,
      { id: nanoid(), company: "", role: "", startDate: "", endDate: "", current: false, location: "", bullets: [""] },
    ]);
  }

  function updateItem(id: string, patch: Partial<ExperienceItem>) {
    onChange(data.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  }

  function removeItem(id: string) {
    onChange(data.filter((item) => item.id !== id));
    if (aiOpenFor === id) setAiOpenFor(null);
  }

  function addBullet(id: string) {
    const item = data.find((i) => i.id === id);
    if (!item) return;
    updateItem(id, { bullets: [...item.bullets, ""] });
  }

  function updateBullet(itemId: string, bulletIndex: number, value: string) {
    const item = data.find((i) => i.id === itemId);
    if (!item) return;
    updateItem(itemId, { bullets: item.bullets.map((b, i) => (i === bulletIndex ? value : b)) });
  }

  function removeBullet(itemId: string, bulletIndex: number) {
    const item = data.find((i) => i.id === itemId);
    if (!item) return;
    updateItem(itemId, { bullets: item.bullets.filter((_, i) => i !== bulletIndex) });
  }

  function insertAIBullet(itemId: string, bullet: string) {
    const item = data.find((i) => i.id === itemId);
    if (!item) return;
    // Replace the last empty bullet, or append
    const lastEmpty = item.bullets.lastIndexOf("");
    if (lastEmpty !== -1) {
      const updated = [...item.bullets];
      updated[lastEmpty] = bullet;
      updateItem(itemId, { bullets: updated });
    } else {
      updateItem(itemId, { bullets: [...item.bullets, bullet] });
    }
  }

  return (
    <div className="pt-3 space-y-4">
      {data.map((item, idx) => (
        <div key={item.id} className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
          {/* Item header */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Experience {idx + 1}
            </span>
            <DeleteButton onClick={() => removeItem(item.id)} />
          </div>

          <FormField label="Job title">
            <Input value={item.role} onChange={(v) => updateItem(item.id, { role: v })} placeholder="Software Engineer" />
          </FormField>
          <FormRow>
            <FormField label="Company">
              <Input value={item.company} onChange={(v) => updateItem(item.id, { company: v })} placeholder="Acme Corp" />
            </FormField>
            <FormField label="Location">
              <Input value={item.location} onChange={(v) => updateItem(item.id, { location: v })} placeholder="Remote" />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField label="Start date">
              <Input value={item.startDate} onChange={(v) => updateItem(item.id, { startDate: v })} placeholder="Jan 2022" />
            </FormField>
            <FormField label="End date">
              <Input
                value={item.current ? "Present" : item.endDate}
                onChange={(v) => updateItem(item.id, { endDate: v, current: false })}
                placeholder="Dec 2024"
              />
            </FormField>
          </FormRow>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id={`current-${item.id}`}
              checked={item.current}
              onChange={(e) => updateItem(item.id, { current: e.target.checked, endDate: "" })}
              className="accent-emerald-600"
            />
            <label htmlFor={`current-${item.id}`} className="text-xs text-gray-500">
              I currently work here
            </label>
          </div>

          {/* ── Bullet points ── */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-gray-500">Bullet points</p>

              {/* AI toggle button */}
              <button
                onClick={() => setAiOpenFor(aiOpenFor === item.id ? null : item.id)}
                className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-lg transition-all ${
                  aiOpenFor === item.id
                    ? "bg-emerald-600 text-white"
                    : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
                }`}
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L13.5 8.5L20 10L13.5 11.5L12 18L10.5 11.5L4 10L10.5 8.5L12 2Z"/>
                </svg>
                {aiOpenFor === item.id ? "Hide AI" : "Write with AI"}
              </button>
            </div>

            {/* Manual bullets */}
            <div className="space-y-2">
              {item.bullets.map((bullet, bIdx) => (
                <div key={bIdx} className="flex gap-2 items-start">
                  <span className="text-gray-300 mt-2.5 text-xs">•</span>
                  <Textarea
                    value={bullet}
                    onChange={(v) => updateBullet(item.id, bIdx, v)}
                    placeholder="Reduced API latency by 40% by implementing Redis caching…"
                    rows={2}
                  />
                  <button
                    onClick={() => removeBullet(item.id, bIdx)}
                    className="text-gray-200 hover:text-red-400 mt-2 transition-colors shrink-0"
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={() => addBullet(item.id)}
              className="mt-2 text-xs text-emerald-600 hover:text-emerald-700 font-medium"
            >
              + Add bullet manually
            </button>
          </div>

          {/* ── AI Bullet Generator panel ── */}
          {aiOpenFor === item.id && (
            <AIBulletGenerator
              role={item.role}
              company={item.company}
              existing={item.bullets.filter(Boolean)}
              onInsert={(bullet) => insertAIBullet(item.id, bullet)}
              onClose={() => setAiOpenFor(null)}
            />
          )}
        </div>
      ))}

      <AddButton onClick={addItem} label="Add experience" />
    </div>
  );
}