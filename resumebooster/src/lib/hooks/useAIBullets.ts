// src/lib/hooks/useAIBullets.ts
// React hook that calls /api/ai/bullets and streams the response.
// Returns generated bullets line-by-line as they stream in.

"use client";

import { useState, useCallback } from "react";

export interface AIBulletsInput {
  role:        string;
  company:     string;
  description: string;
  count:       number;
  existing?:   string[];
}

export interface AIBulletsState {
  streaming:  boolean;
  bullets:    string[];       // completed bullets (fully streamed lines)
  partial:    string;         // current in-progress line being streamed
  error:      string | null;
  remaining:  number | null;  // rate limit remaining
  plan:       string | null;
}

export function useAIBullets() {
  const [state, setState] = useState<AIBulletsState>({
    streaming: false,
    bullets:   [],
    partial:   "",
    error:     null,
    remaining: null,
    plan:      null,
  });

  const generate = useCallback(async (input: AIBulletsInput) => {
    setState({ streaming: true, bullets: [], partial: "", error: null, remaining: null, plan: null });

    try {
      const res = await fetch("/api/ai/bullets", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(input),
      });

      // Handle non-streaming error responses (401, 429, 400)
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const message =
          res.status === 429
            ? data.message ?? "Rate limit reached. Upgrade to Pro for unlimited AI."
            : data.error   ?? "Something went wrong. Please try again.";
        setState((s) => ({ ...s, streaming: false, error: message }));
        return;
      }

      // Read the stream
      const reader  = res.body!.getReader();
      const decoder = new TextDecoder();
      let   buffer  = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // Check for metadata / error signals at end of stream
        if (buffer.includes("__META__")) {
          const [text, metaRaw] = buffer.split("__META__");
          buffer = text;
          try {
            const meta = JSON.parse(metaRaw.trim());
            setState((s) => ({ ...s, remaining: meta.remaining, plan: meta.plan }));
          } catch { /* ignore parse errors */ }
        }

        if (buffer.includes("__ERROR__")) {
          const errMsg = buffer.split("__ERROR__")[1]?.trim() ?? "Generation failed";
          setState((s) => ({ ...s, streaming: false, error: errMsg }));
          return;
        }

        // Split buffer into completed lines + partial last line
        const lines = buffer.split("\n");
        const completedLines = lines.slice(0, -1).filter((l) => l.trim());
        const partial = lines[lines.length - 1];
        buffer = partial; // keep the incomplete line in the buffer

        if (completedLines.length) {
          setState((s) => ({
            ...s,
            bullets: [...s.bullets, ...completedLines],
            partial: "",
          }));
        } else {
          setState((s) => ({ ...s, partial }));
        }
      }

      // Flush remaining buffer
      if (buffer.trim() && !buffer.startsWith("__")) {
        setState((s) => ({ ...s, bullets: [...s.bullets, buffer.trim()], partial: "" }));
      }
    } catch (err: any) {
      setState((s) => ({
        ...s,
        error: err?.message ?? "Network error. Please try again.",
      }));
    } finally {
      setState((s) => ({ ...s, streaming: false, partial: "" }));
    }
  }, []);

  const reset = useCallback(() => {
    setState({ streaming: false, bullets: [], partial: "", error: null, remaining: null, plan: null });
  }, []);

  return { ...state, generate, reset };
}