export type SectionType = "header" | "summary" | "experience" | "education" | "skills" | "projects" | "certifications";

export type TemplateId = "jake" | "minimal" | "modern";

export interface HeaderData {
    name: string;
    email: string;
    phone: string;
    location: string;
    linkedin: string;
    github: string;
    website: string;
}

export interface SummaryData {
    text: string;
}

export interface ExperienceItem{
    id: string;
    company: string;
    role: string;
    startDate: string;
    endDate: string;
    current: boolean;
    location: string;
    bullets: string[];
}

export interface EducationItem {
    id: string;
    institution: string;
    degree: string;
    fieldOfStudy: string;
    startDate: string;
    endDate: string;
    gpa: string;
    honors: string;
}

export interface SkillItem {
    categories: { id: string; label: string; skills: string[] }[];
}

export interface ProjectItem {
    id: string;
    name: string;
    description: string;
    techStack: string[];
    url: string;
    github: string;
    startDate: string;
    endDate: string;
    bullets: string[];
}

export interface CertificationItem {
    id: string;
    name: string;
    issuer: string;
    date: string;
    url: string;
}

export type SectionData = 
    | { type: "header"; data: HeaderData }
    | { type: "summary"; data: SummaryData }
    | { type: "experience"; data: ExperienceItem[] }
    | { type: "education"; data: EducationItem[] }
    | { type: "skills"; data: SkillItem }
    | { type: "projects"; data: ProjectItem[] }
    | { type: "certifications"; data: CertificationItem[] };

    export interface ResumeSection {
        id: string;
        type: SectionType;
        label: string;
        visible: boolean;
        data: SectionData["data"];
    }

    export interface ResumeContent {
        sections: ResumeSection[];
        templateId: TemplateId;
    }
    
    export const Default_Resume_Content: ResumeContent = {
        templateId: "jake",
        sections: [
            {
                id: "header",
                type: "header",
                label: "Header",
                visible: true,
                data: {
                    name: "John Doe",
                    email: "john.doe@example.com", 
                    phone: "123-456-7890",
                    location: "City, State",
                    linkedin: "linkedin.com/in/johndoe",
                    github: "github.com/johndoe",
                    website: "johndoe.com"
                }
            },
            {
                id: "summary",  
                type: "summary",
                label: "Summary",
                visible: true,
                data: {
                    text: "Experienced software engineer with a passion for developing innovative programs that expedite the efficiency and effectiveness of organizational success. Proficient in technology and writing code to create systems that are reliable and user-friendly."
                }
            },
            {
                id: "experience",
                type: "experience",
                label: "Experience",
                visible: true,
                data: [
                    {
                        id: "exp1",
                        company: "Tech Company",
                        role: "Software Engineer",
                        startDate: "Jan 2020",
                        endDate: "Present",         
                        current: true,
                        location: "City, State",
                        bullets: [
                            "Developed and maintained web applications using React and Node.js.",
                            "Collaborated with cross-functional teams to define, design, and ship new features.",
                            "Optimized applications for maximum speed and scalability."
                        ]
                    }
                ]
            },
            {
                id: "education",
                type: "education",
                label: "Education",
                visible: true,
                data: [
                    {
                        id: "edu1",
                        institution: "University Name",
                        degree: "Bachelor of Science",
                        fieldOfStudy: "Computer Science",
                        startDate: "Sep 2015",
                        endDate: "Jun 2019",
                        gpa: "3.8",
                        honors: "Cum Laude"
                    }
                ]
            },
            {
                id: "skills",
                type: "skills",
                label: "Skills",
                visible: true,
                data: {
                    categories: [
                        {
                            id: "cat1",
                            label: "Programming Languages",
                            skills: ["JavaScript", "Python", "Java"]
                        },
                        {
                            id: "cat2",
                            label: "Frameworks",
                            skills: ["React", "Node.js", "Express"]
                        }
                    ]
                }
            },
            {
                id: "projects",
                type: "projects",
                label: "Projects",
                visible: true,
                data: [
                    {
                        id: "proj1",
                        name: "Project Name",
                        description: "A brief description of the project.",
                        techStack: ["React", "Node.js"],
                        url: "https://project-url.com",
                        github: "",
                        startDate: "Jan 2021",
                        endDate: "Jun 2021",
                        bullets: [
                            "Implemented feature X using React.",
                            "Designed and developed RESTful APIs with Node.js."
                        ]
                    }
                ]
            },
            {
                id: "certifications",
                type: "certifications",
                label: "Certifications",
                visible: true,
                data: [
                    {
                        id: "cert1",
                        name: "Certification Name",
                        issuer: "Issuing Organization",
                        date: "Jan 2022",
                        url: "https://certification-url.com"
                    }
                ]
            }
        ]
    }
    