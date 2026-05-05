// src/lib/gemini.ts
// Singleton Gemini client — imported by all AI API routes.
// Uses gemini-1.5-flash for low latency on bullet generation.

import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

if (!process.env.GEMINI_API_KEY) {
  throw new Error("Missing GEMINI_API_KEY environment variable");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Safety settings — resume content should never trigger these, but be explicit
const SAFETY_SETTINGS = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT,        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,       threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
];

// Flash model for low-latency streaming
export function getBulletModel() {
  return genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    safetySettings: SAFETY_SETTINGS,
    generationConfig: {
      temperature: 0.7,      // creative but controlled
      topP: 0.9,
      maxOutputTokens: 1024, // enough for 5 bullets
    },
  });
}