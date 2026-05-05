// src/lib/renderResumeHtml.ts
// Converts ResumeContent JSON → a full self-contained HTML string.
// Used by the Puppeteer PDF export route. Must produce identical output to
// the React live preview so WYSIWYG accuracy is maintained.

import {
  ResumeContent,
  HeaderData,
  SummaryData,
  ExperienceItem,
  EducationItem,
  SkillItem,
  ProjectItem,
  CertificationItem,
} from "@/types/resume";

export function renderResumeHtml(content: ResumeContent, template: string): string {
  const css = getTemplateCss(template);
  const body = content.sections
    .filter((s) => s.visible)
    .map((s) => renderSection(s.type, s.data as any, s.label))
    .join("\n");

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<style>${css}</style>
</head>
<body>
<div class="resume">
${body}
</div>
</body>
</html>`;
}

function renderSection(type: string, data: any, label: string): string {
  switch (type) {
    case "header":   return renderHeader(data as HeaderData);
    case "summary":  return renderSummary(data as SummaryData);
    case "experience": return renderExperience(data as ExperienceItem[], label);
    case "education":  return renderEducation(data as EducationItem[], label);
    case "skills":     return renderSkills(data as SkillItem, label);
    case "projects":   return renderProjects(data as ProjectItem[], label);
    case "certifications": return renderCerts(data as CertificationItem[], label);
    default: return "";
  }
}

// ── Section renderers ────────────────────────────────────────────────────────

function renderHeader(d: HeaderData) {
  const links = [
    d.email    && `<a href="mailto:${d.email}">${d.email}</a>`,
    d.phone    && `<span>${d.phone}</span>`,
    d.location && `<span>${d.location}</span>`,
    d.linkedin && `<a href="${d.linkedin}">LinkedIn</a>`,
    d.github   && `<a href="${d.github}">GitHub</a>`,
    d.website  && `<a href="${d.website}">${d.website}</a>`,
  ].filter(Boolean).join('<span class="sep"> | </span>');

  return `<header class="resume-header">
  <h1>${d.name || "Your Name"}</h1>
  <div class="contact-links">${links}</div>
</header>`;
}

function renderSummary(d: SummaryData) {
  if (!d.text) return "";
  return `<section class="resume-section">
  <h2 class="section-title">Summary</h2>
  <div class="section-divider"></div>
  <p class="summary-text">${d.text}</p>
</section>`;
}

function renderExperience(items: ExperienceItem[], label: string) {
  if (!items.length) return "";
  return `<section class="resume-section">
  <h2 class="section-title">${label}</h2>
  <div class="section-divider"></div>
  ${items.map((item) => `
  <div class="entry">
    <div class="entry-header">
      <span class="entry-primary">${item.role}</span>
      <span class="entry-date">${item.startDate} – ${item.current ? "Present" : item.endDate}</span>
    </div>
    <div class="entry-sub">
      <span>${item.company}</span>
      ${item.location ? `<span>${item.location}</span>` : ""}
    </div>
    ${item.bullets.length ? `<ul>${item.bullets.map((b) => `<li>${b}</li>`).join("")}</ul>` : ""}
  </div>`).join("")}
</section>`;
}

function renderEducation(items: EducationItem[], label: string) {
  if (!items.length) return "";
  return `<section class="resume-section">
  <h2 class="section-title">${label}</h2>
  <div class="section-divider"></div>
  ${items.map((item) => `
  <div class="entry">
    <div class="entry-header">
      <span class="entry-primary">${item.institution}</span>
      <span class="entry-date">${item.startDate} – ${item.endDate}</span>
    </div>
    <div class="entry-sub">
      <span>${item.degree}${item.fieldOfStudy ? ` in ${item.fieldOfStudy}` : ""}</span>
      ${item.gpa ? `<span>GPA: ${item.gpa}</span>` : ""}
    </div>
  </div>`).join("")}
</section>`;
}

function renderSkills(d: SkillItem, label: string) {
  if (!d.categories.length) return "";
  return `<section class="resume-section">
  <h2 class="section-title">${label}</h2>
  <div class="section-divider"></div>
  <div class="skills-grid">
    ${d.categories.map((cat: { id: string; label: string; skills: string[] }) => `
    <div class="skill-row">
      <span class="skill-label">${cat.label}:</span>
      <span class="skill-values">${cat.skills.join(", ")}</span>
    </div>`).join("")}
  </div>
</section>`;
}

function renderProjects(items: ProjectItem[], label: string) {
  if (!items.length) return "";
  return `<section class="resume-section">
  <h2 class="section-title">${label}</h2>
  <div class="section-divider"></div>
  ${items.map((item) => `
  <div class="entry">
    <div class="entry-header">
      <span class="entry-primary">${item.name}${item.techStack.length ? ` <span class="tech-stack">| ${item.techStack.join(", ")}</span>` : ""}</span>
      ${item.startDate ? `<span class="entry-date">${item.startDate}${item.endDate ? ` – ${item.endDate}` : ""}</span>` : ""}
    </div>
    ${item.description ? `<p>${item.description}</p>` : ""}
    ${item.bullets.length ? `<ul>${item.bullets.map((b) => `<li>${b}</li>`).join("")}</ul>` : ""}
  </div>`).join("")}
</section>`;
}

function renderCerts(items: CertificationItem[], label: string) {
  if (!items.length) return "";
  return `<section class="resume-section">
  <h2 class="section-title">${label}</h2>
  <div class="section-divider"></div>
  ${items.map((c) => `
  <div class="entry">
    <div class="entry-header">
      <span class="entry-primary">${c.name}</span>
      <span class="entry-date">${c.date}</span>
    </div>
    <div class="entry-sub"><span>${c.issuer}</span></div>
  </div>`).join("")}
</section>`;
}

// ── Template CSS ─────────────────────────────────────────────────────────────

function getTemplateCss(template: string): string {
  const base = `
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Times New Roman', serif; font-size: 11pt; color: #000; background: #fff; }
    a { color: inherit; text-decoration: none; }
    .resume { max-width: 210mm; margin: 0 auto; padding: 18mm 16mm; }
    ul { padding-left: 16px; margin-top: 4px; }
    li { margin-bottom: 2px; line-height: 1.4; }
    .section-divider { border-top: 1px solid #000; margin: 2px 0 6px; }
    .entry { margin-bottom: 10px; }
    .entry-header { display: flex; justify-content: space-between; align-items: baseline; }
    .entry-primary { font-weight: bold; font-size: 11pt; }
    .entry-date { font-size: 10pt; white-space: nowrap; }
    .entry-sub { display: flex; justify-content: space-between; font-style: italic; font-size: 10pt; margin-bottom: 3px; }
    .sep { color: #666; }
  `;

  if (template === "jake") return base + `
    .resume-header { text-align: center; margin-bottom: 10px; }
    .resume-header h1 { font-size: 22pt; font-weight: bold; letter-spacing: 1px; text-transform: uppercase; }
    .contact-links { font-size: 10pt; margin-top: 3px; }
    .resume-section { margin-bottom: 10px; }
    .section-title { font-size: 12pt; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; }
    .skills-grid { font-size: 10.5pt; }
    .skill-row { margin-bottom: 3px; }
    .skill-label { font-weight: bold; }
    .tech-stack { font-weight: normal; font-style: italic; }
    .summary-text { font-size: 10.5pt; line-height: 1.5; }
  `;

  if (template === "minimal") return `
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 10.5pt; color: #1a1a1a; background: #fff; }
    a { color: #1a1a1a; }
    .resume { max-width: 210mm; margin: 0 auto; padding: 20mm 18mm; }
    ul { padding-left: 16px; margin-top: 4px; }
    li { margin-bottom: 3px; line-height: 1.5; }
    .section-divider { border-top: 0.5px solid #ccc; margin: 4px 0 8px; }
    .entry { margin-bottom: 12px; }
    .entry-header { display: flex; justify-content: space-between; align-items: baseline; }
    .entry-primary { font-weight: 600; font-size: 10.5pt; }
    .entry-date { font-size: 9.5pt; color: #666; white-space: nowrap; }
    .entry-sub { display: flex; justify-content: space-between; color: #555; font-size: 9.5pt; margin-bottom: 4px; }
    .sep { color: #bbb; }
    .resume-header { margin-bottom: 16px; border-bottom: 0.5px solid #ccc; padding-bottom: 12px; }
    .resume-header h1 { font-size: 20pt; font-weight: 300; letter-spacing: -0.5px; color: #1a1a1a; }
    .contact-links { font-size: 9.5pt; color: #555; margin-top: 5px; }
    .resume-section { margin-bottom: 14px; }
    .section-title { font-size: 9pt; font-weight: 600; text-transform: uppercase; letter-spacing: 1.5px; color: #888; }
    .skills-grid { font-size: 10pt; }
    .skill-row { margin-bottom: 4px; }
    .skill-label { font-weight: 600; }
    .tech-stack { color: #666; }
    .summary-text { font-size: 10pt; line-height: 1.6; color: #333; }
  `;

  // modern
  return `
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Georgia', serif; font-size: 10.5pt; color: #1e293b; background: #fff; }
    a { color: #2563eb; }
    .resume { max-width: 210mm; margin: 0 auto; display: grid; grid-template-columns: 1fr; padding: 0; }
    .resume-header { background: #1e293b; color: #fff; padding: 22mm 18mm 14mm; }
    .resume-header h1 { font-size: 24pt; font-weight: bold; color: #fff; }
    .contact-links { font-size: 9.5pt; color: #94a3b8; margin-top: 6px; }
    .contact-links a { color: #93c5fd; }
    .sep { color: #475569; }
    .resume-section { margin: 0; padding: 10px 18mm; border-left: 3px solid #e2e8f0; margin-left: 18mm; margin-top: 10px; }
    .section-title { font-size: 11pt; font-weight: bold; color: #2563eb; text-transform: uppercase; letter-spacing: 0.5px; }
    .section-divider { border-top: 1px solid #e2e8f0; margin: 3px 0 8px; }
    ul { padding-left: 16px; margin-top: 4px; }
    li { margin-bottom: 3px; line-height: 1.5; }
    .entry { margin-bottom: 12px; }
    .entry-header { display: flex; justify-content: space-between; align-items: baseline; }
    .entry-primary { font-weight: bold; font-size: 10.5pt; }
    .entry-date { font-size: 9.5pt; color: #64748b; white-space: nowrap; }
    .entry-sub { display: flex; justify-content: space-between; color: #64748b; font-size: 9.5pt; margin-bottom: 4px; font-style: italic; }
    .skills-grid { font-size: 10pt; }
    .skill-row { margin-bottom: 4px; }
    .skill-label { font-weight: bold; color: #1e293b; }
    .tech-stack { color: #64748b; }
    .summary-text { font-size: 10pt; line-height: 1.6; }
  `;
}