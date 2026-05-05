// src/components/resume/ResumePreview.tsx
// Live preview rendered in the browser. Mirrors the HTML produced by renderResumeHtml.ts.

"use client";
import { ResumeContent, HeaderData, SummaryData, ExperienceItem, EducationItem, SkillItem, ProjectItem } from "@/types/resume";

interface Props { content: ResumeContent; }

export function ResumePreview({ content }: Props) {
  const t = content.templateId ?? "jake";

  return (
    <div
      className="bg-white shadow-xl"
      style={{ width: "210mm", minHeight: "297mm", fontFamily: t === "minimal" ? "'Helvetica Neue', Arial, sans-serif" : t === "modern" ? "Georgia, serif" : "'Times New Roman', serif" }}
    >
      {content.sections.filter((s) => s.visible).map((section) => {
        switch (section.type) {
          case "header":     return <HeaderBlock key={section.id} data={section.data as HeaderData} template={t} />;
          case "summary":    return <SummaryBlock key={section.id} data={section.data as SummaryData} template={t} />;
          case "experience": return <ExperienceBlock key={section.id} data={section.data as ExperienceItem[]} label={section.label} template={t} />;
          case "education":  return <EducationBlock key={section.id} data={section.data as EducationItem[]} label={section.label} template={t} />;
          case "skills":     return <SkillsBlock key={section.id} data={section.data as SkillItem} label={section.label} template={t} />;
          case "projects":   return <ProjectsBlock key={section.id} data={section.data as ProjectItem[]} label={section.label} template={t} />;
          default:           return null;
        }
      })}
    </div>
  );
}

// ── Shared style helpers ─────────────────────────────────────────────────────

function sectionTitleStyle(t: string) {
  if (t === "jake")    return { fontSize: 11, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: 0.5, marginBottom: 2 };
  if (t === "minimal") return { fontSize: 8, fontWeight: 600, textTransform: "uppercase" as const, letterSpacing: 2, color: "#888", marginBottom: 3 };
  return { fontSize: 10, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: 0.5, color: "#2563eb", marginBottom: 3 };
}

function dividerStyle(t: string) {
  return { borderTop: t === "minimal" ? "0.5px solid #ccc" : "1px solid " + (t === "modern" ? "#e2e8f0" : "#000"), marginBottom: 6 };
}

function sectionPad(t: string) {
  if (t === "modern") return { padding: "10px 18mm", borderLeft: "3px solid #e2e8f0", marginLeft: 18 * 3.78, marginTop: 10 };
  return { padding: "0 16mm 8px" };
}

// ── Header ───────────────────────────────────────────────────────────────────

function HeaderBlock({ data, template: t }: { data: HeaderData; template: string }) {
  const links = [data.email, data.phone, data.location, data.linkedin && "LinkedIn", data.github && "GitHub"].filter(Boolean).join(" | ");

  if (t === "modern") return (
    <div style={{ background: "#1e293b", color: "#fff", padding: "22mm 18mm 14mm" }}>
      <div style={{ fontSize: 22, fontWeight: 700 }}>{data.name || "Your Name"}</div>
      <div style={{ fontSize: 9, color: "#94a3b8", marginTop: 5 }}>{links}</div>
    </div>
  );

  return (
    <div style={{ textAlign: t === "jake" ? "center" : "left", padding: t === "minimal" ? "20mm 18mm 12mm" : "18mm 16mm 6px", borderBottom: t === "minimal" ? "0.5px solid #ccc" : "none" }}>
      <div style={{ fontSize: t === "jake" ? 20 : 18, fontWeight: t === "jake" ? 700 : 300, letterSpacing: t === "jake" ? 1 : -0.5, textTransform: t === "jake" ? "uppercase" as const : "none" as const }}>
        {data.name || "Your Name"}
      </div>
      <div style={{ fontSize: 9, color: t === "minimal" ? "#555" : "#333", marginTop: 4 }}>{links}</div>
    </div>
  );
}

// ── Summary ──────────────────────────────────────────────────────────────────

function SummaryBlock({ data, template: t }: { data: SummaryData; template: string }) {
  if (!data.text) return null;
  return (
    <div style={sectionPad(t)}>
      <div style={sectionTitleStyle(t)}>Summary</div>
      <div style={dividerStyle(t)} />
      <p style={{ fontSize: 9.5, lineHeight: 1.5, color: t === "minimal" ? "#333" : "#000" }}>{data.text}</p>
    </div>
  );
}

// ── Experience ───────────────────────────────────────────────────────────────

function ExperienceBlock({ data, label, template: t }: { data: ExperienceItem[]; label: string; template: string }) {
  if (!data.length) return null;
  return (
    <div style={sectionPad(t)}>
      <div style={sectionTitleStyle(t)}>{label}</div>
      <div style={dividerStyle(t)} />
      {data.map((item) => (
        <div key={item.id} style={{ marginBottom: 8 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, fontSize: 10 }}>
            <span>{item.role}</span>
            <span style={{ fontWeight: 400, fontSize: 9, color: t === "minimal" ? "#666" : "#000" }}>{item.startDate}{item.startDate && " – "}{item.current ? "Present" : item.endDate}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontStyle: "italic", fontSize: 9.5, color: t === "minimal" ? "#555" : "#000", marginBottom: 2 }}>
            <span>{item.company}</span><span>{item.location}</span>
          </div>
          {item.bullets.filter(Boolean).map((b, i) => (
            <div key={i} style={{ display: "flex", gap: 4, fontSize: 9.5, lineHeight: 1.4 }}>
              <span>•</span><span>{b}</span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

// ── Education ────────────────────────────────────────────────────────────────

function EducationBlock({ data, label, template: t }: { data: EducationItem[]; label: string; template: string }) {
  if (!data.length) return null;
  return (
    <div style={sectionPad(t)}>
      <div style={sectionTitleStyle(t)}>{label}</div>
      <div style={dividerStyle(t)} />
      {data.map((item) => (
        <div key={item.id} style={{ marginBottom: 8 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, fontSize: 10 }}>
            <span>{item.institution}</span>
            <span style={{ fontWeight: 400, fontSize: 9 }}>{item.startDate}{item.startDate && " – "}{item.endDate}</span>
          </div>
          <div style={{ fontStyle: "italic", fontSize: 9.5, color: t === "minimal" ? "#555" : "#000" }}>
            {item.degree}{item.fieldOfStudy ? ` in ${item.fieldOfStudy}` : ""}{item.gpa ? ` · GPA: ${item.gpa}` : ""}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Skills ───────────────────────────────────────────────────────────────────

function SkillsBlock({ data, label, template: t }: { data: SkillItem; label: string; template: string }) {
  if (!data.categories.length) return null;
  return (
    <div style={sectionPad(t)}>
      <div style={sectionTitleStyle(t)}>{label}</div>
      <div style={dividerStyle(t)} />
      {data.categories.map((cat: { id: string; label: string; skills: string[] }) => (
        <div key={cat.id} style={{ fontSize: 9.5, marginBottom: 3 }}>
          <span style={{ fontWeight: 700 }}>{cat.label}: </span>
          <span>{cat.skills.join(", ")}</span>
        </div>
      ))}
    </div>
  );
}

// ── Projects ─────────────────────────────────────────────────────────────────

function ProjectsBlock({ data, label, template: t }: { data: ProjectItem[]; label: string; template: string }) {
  if (!data.length) return null;
  return (
    <div style={sectionPad(t)}>
      <div style={sectionTitleStyle(t)}>{label}</div>
      <div style={dividerStyle(t)} />
      {data.map((item) => (
        <div key={item.id} style={{ marginBottom: 8 }}>
          <div style={{ fontWeight: 700, fontSize: 10 }}>
            {item.name}{item.techStack.length ? <span style={{ fontWeight: 400, fontStyle: "italic" }}> | {item.techStack.join(", ")}</span> : ""}
          </div>
          {item.description && <p style={{ fontSize: 9.5 }}>{item.description}</p>}
          {item.bullets.filter(Boolean).map((b, i) => (
            <div key={i} style={{ display: "flex", gap: 4, fontSize: 9.5, lineHeight: 1.4 }}>
              <span>•</span><span>{b}</span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}