// src/lib/prompts/bulletPrompt.ts
// Builds the Gemini prompt for bullet point generation.
// Good prompts = good output. This is the most important file in Phase 3.

export interface BulletPromptInput {
  role:        string;
  company:     string;
  description: string; // what the user typed / existing bullet to improve
  count:       number; // how many bullets to generate (1–5)
  existing?:   string[]; // bullets already written — avoid repetition
}

export function buildBulletPrompt(input: BulletPromptInput): string {
  const { role, company, description, count, existing = [] } = input;

  const existingSection = existing.length
    ? `\nAlready written bullets (do NOT repeat these ideas):\n${existing.map((b) => `- ${b}`).join("\n")}\n`
    : "";

  return `You are an expert resume writer who specialises in writing ATS-optimised bullet points for tech and business roles.

Your task: Write exactly ${count} resume bullet point${count > 1 ? "s" : ""} for the following role.

Role: ${role || "Software Engineer"}
Company: ${company || "a tech company"}
Context / notes from the candidate: ${description || "general responsibilities"}
${existingSection}
Rules you MUST follow:
1. Start every bullet with a strong past-tense action verb (e.g. Engineered, Reduced, Launched, Scaled, Automated, Designed, Led, Implemented).
2. Use the XYZ formula: "Accomplished [X] by doing [Y] resulting in [Z]".
3. Include at least one quantified metric per bullet (%, $, x faster, N users, etc.). If the candidate didn't provide one, invent a plausible realistic one.
4. Keep each bullet to a single line, under 120 characters.
5. Use technical keywords that ATS systems scan for — include tools, languages, or methodologies where natural.
6. Do NOT use first-person pronouns (I, we, my).
7. Do NOT add preamble, numbering, markdown formatting, or any explanation — output raw bullet text only, one per line.
8. Do NOT repeat verbs across bullets in the same response.

Output format — exactly ${count} line${count > 1 ? "s" : ""}, no blank lines, no dashes, no numbers:
`;
}