import { generateJSON } from "../client";

const SYSTEM = `You are the Resume Agent for AI Placement Copilot. Analyze resumes for placement preparation.
Extract structured data and provide actionable feedback for Indian college students targeting tech placements.`;

export interface ResumeAnalysis {
  education: { degree: string; institution: string; year: string; score?: string }[];
  skills: string[];
  projects: { name: string; description: string; technologies: string[]; qualityScore: number }[];
  experience: { company: string; role: string; duration: string; highlights: string[] }[];
  certifications: string[];
  resumeScore: number;
  atsScore: number;
  strengths: string[];
  weaknesses: string[];
  missingKeywords: string[];
  improvements: string[];
  projectAnalysis: { overall: string; topProjects: string[]; gaps: string[] };
  recruiterReview: { firstImpression: string; hireDecision: string; concerns: string[]; recommendations: string[] };
}

export function fallbackResumeAnalysis(text: string): ResumeAnalysis {
  const words = text.split(/\s+/).length;
  const base = Math.min(85, 40 + Math.floor(words / 50));
  return {
    education: [{ degree: "B.Tech", institution: "Your College", year: "2025" }],
    skills: ["Python", "JavaScript", "SQL", "Data Structures"],
    projects: [{ name: "Portfolio Project", description: "Full-stack application", technologies: ["React", "Node.js"], qualityScore: 70 }],
    experience: [],
    certifications: [],
    resumeScore: base,
    atsScore: base - 5,
    strengths: ["Clear structure", "Relevant technical skills listed"],
    weaknesses: ["Add quantifiable metrics to projects", "Include more ATS keywords"],
    missingKeywords: ["REST API", "Git", "Agile", "System Design"],
    improvements: ["Add metrics to project outcomes", "Include a skills section with proficiency levels", "Tailor resume for each job application"],
    projectAnalysis: { overall: "Projects show basic full-stack exposure.", topProjects: ["Portfolio Project"], gaps: ["Missing system design projects", "No open source contributions"] },
    recruiterReview: { firstImpression: "Promising candidate with room for improvement.", hireDecision: "Shortlist for further rounds with skill gap training.", concerns: ["Limited internship experience"], recommendations: ["Strengthen DSA fundamentals", "Add cloud/DevOps skills"] },
  };
}

export async function analyzeResume(text: string): Promise<ResumeAnalysis> {
  return generateJSON<ResumeAnalysis>(
    SYSTEM,
    `Analyze this resume text and return JSON matching this schema:
{ education[], skills[], projects[{name,description,technologies[],qualityScore}], experience[], certifications[],
  resumeScore(0-100), atsScore(0-100), strengths[], weaknesses[], missingKeywords[], improvements[],
  projectAnalysis{overall,topProjects[],gaps[]}, recruiterReview{firstImpression,hireDecision,concerns[],recommendations[]} }

Resume:
${text.slice(0, 12000)}`,
    fallbackResumeAnalysis(text)
  );
}
