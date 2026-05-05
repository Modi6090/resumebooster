// src/components/resume/sections/AIBulletGenerator.tsx
// Slide-in panel that appears inside the ExperienceForm.
// Users describe their role → AI streams back bullets → they pick which to insert.

"use client";

import { useState } from "react";
import { useAIBullets } from "@/lib/hooks/useAIBullets";

interface Props {
  role:      string;
  company:   string;
  existing:  string[];
  onInsert:  (bullet: string) => void;
  onClose:   () => void;
}

export function AIBulletGenerator({ role, company, existing, onInsert, onClose }: Props) {
  const [description, setDescription] = useState("");
  const [count,       setCount]       = useState(3);
  const [selected,    setSelected]    = useState<Set<number>>(new Set());

  const { streaming, bullets, partial, error, remaining, plan, generate, reset } =
    useAIBullets();

  const hasResults = bullets.length > 0 || !!partial;

  function handleGenerate() {
    reset();
    setSelected(new Set());
    generate({ role, company, description, count, existing });
  }

  function toggleSelect(i: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  }

  function handleInsertSelected() {
    bullets.forEach((b, i) => {
      if (selected.has(i)) onInsert(b);
    });
    onClose();
  }

  return (
    <div className="mt-3 border border-emerald-200 rounded-xl bg-gradient-to-b from-emerald-50 to-white overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-emerald-100">
        <div className="flex items-center gap-2">
          <SparkleIcon />
          <span className="text-sm font-semibold text-emerald-800">AI Bullet Generator</span>
          {remaining !== null && plan === "FREE" && (
            <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
              {remaining} credits left today
            </span>
          )}
          {plan === "PRO" && (
            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">Pro · unlimited</span>
          )}
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      <div className="p-4 space-y-3">
        {/* Context field */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Describe what you did in this role
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. Built the backend API for the checkout flow, reduced load time, mentored junior devs, migrated from MySQL to Postgres…"
            rows={3}
            disabled={streaming}
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-100 transition bg-white placeholder:text-gray-300 resize-none disabled:opacity-60"
          />
        </div>

        {/* Count selector */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-gray-600">Generate</span>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                onClick={() => setCount(n)}
                disabled={streaming}
                className={`w-7 h-7 rounded-lg text-xs font-medium transition-all ${
                  count === n
                    ? "bg-emerald-600 text-white"
                    : "bg-white border border-gray-200 text-gray-500 hover:border-emerald-300"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
          <span className="text-xs text-gray-400">bullet{count > 1 ? "s" : ""}</span>
        </div>

        {/* Generate button */}
        <button
          onClick={handleGenerate}
          disabled={streaming || !description.trim()}
          className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium py-2.5 rounded-xl transition-all"
        >
          {streaming ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Generating…
            </>
          ) : (
            <>
              <SparkleIcon white />
              {hasResults ? "Regenerate" : "Generate bullets"}
            </>
          )}
        </button>

        {/* Error state */}
        {error && (
          <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl p-3">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <div>
              <p className="text-xs font-medium text-red-700">{error}</p>
              {error.includes("Upgrade") && (
                <a href="/dashboard/pricing" className="text-xs text-red-600 underline mt-0.5 block">
                  Upgrade to Pro →
                </a>
              )}
            </div>
          </div>
        )}

        {/* Streamed bullets */}
        {hasResults && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-gray-500">
              {streaming ? "Writing bullets…" : `${bullets.length} bullet${bullets.length !== 1 ? "s" : ""} generated — tap to select`}
            </p>

            {bullets.map((bullet, i) => (
              <BulletCard
                key={i}
                bullet={bullet}
                selected={selected.has(i)}
                onToggle={() => toggleSelect(i)}
                onInsertSingle={() => { onInsert(bullet); onClose(); }}
              />
            ))}

            {/* Streaming partial */}
            {partial && (
              <div className="border border-dashed border-emerald-200 rounded-xl px-4 py-3 bg-emerald-50/50">
                <p className="text-sm text-gray-700 leading-relaxed">
                  {partial}
                  <span className="inline-block w-0.5 h-4 bg-emerald-500 ml-0.5 animate-pulse align-middle" />
                </p>
              </div>
            )}

            {/* Insert selected */}
            {selected.size > 0 && !streaming && (
              <button
                onClick={handleInsertSelected}
                className="w-full bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium py-2.5 rounded-xl transition-colors"
              >
                Insert {selected.size} selected bullet{selected.size > 1 ? "s" : ""}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Sub-components ───────────────────────────────────────────────────────────

function BulletCard({
  bullet,
  selected,
  onToggle,
  onInsertSingle,
}: {
  bullet:        string;
  selected:      boolean;
  onToggle:      () => void;
  onInsertSingle:() => void;
}) {
  return (
    <div
      onClick={onToggle}
      className={`group relative border rounded-xl px-4 py-3 cursor-pointer transition-all ${
        selected
          ? "border-emerald-400 bg-emerald-50 shadow-sm"
          : "border-gray-200 bg-white hover:border-emerald-300 hover:bg-emerald-50/40"
      }`}
    >
      {/* Checkbox */}
      <div className={`absolute top-3 right-3 w-4 h-4 rounded border flex items-center justify-center transition-all ${
        selected ? "bg-emerald-600 border-emerald-600" : "border-gray-300 group-hover:border-emerald-400"
      }`}>
        {selected && (
          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
            <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </div>

      <p className="text-sm text-gray-800 leading-relaxed pr-8">{bullet}</p>

      {/* Quick insert button (appears on hover) */}
      <button
        onClick={(e) => { e.stopPropagation(); onInsertSingle(); }}
        className="absolute bottom-2 right-3 text-xs text-emerald-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity hover:text-emerald-800"
      >
        Insert →
      </button>
    </div>
  );
}

function SparkleIcon({ white }: { white?: boolean }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill={white ? "white" : "#059669"}>
      <path d="M12 2L13.5 8.5L20 10L13.5 11.5L12 18L10.5 11.5L4 10L10.5 8.5L12 2Z"/>
      <path d="M19 16L19.75 18.25L22 19L19.75 19.75L19 22L18.25 19.75L16 19L18.25 18.25L19 16Z" opacity="0.7"/>
      <path d="M5 4L5.5 5.5L7 6L5.5 6.5L5 8L4.5 6.5L3 6L4.5 5.5L5 4Z" opacity="0.5"/>
    </svg>
  );
}