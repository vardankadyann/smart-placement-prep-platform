import { generateJSON } from "../client";

const SYSTEM = `You are the Job Description Agent for AI Placement Copilot. 
Analyze job descriptions for Indian tech placements and internships.`;

export interface JDAnalysis {
  requiredSkills: string[];
  hiddenSkills: string[];
  technicalSkills: string[];
  softSkills: string[];
  atsKeywords: string[];
  interviewFocus: string[];
  expectedDifficulty: string;
  hiringPriorities: string[];
}

export function fallbackJDAnalysis(company: string, role: string): JDAnalysis {
  return {
    requiredSkills: ["Data Structures", "Algorithms", "Problem Solving", role.includes("Full") ? "Full Stack" : "Core CS"],
    hiddenSkills: ["System Design Basics", "Version Control", "Debugging"],
    technicalSkills: ["Python/Java", "SQL", "REST APIs", "OOP"],
    softSkills: ["Communication", "Teamwork", "Problem Solving", "Adaptability"],
    atsKeywords: [company, role, "B.Tech", "CGPA", "Projects", "Internship"],
    interviewFocus: ["DSA Round", "Technical Deep Dive", "HR/Behavioral", "Project Discussion"],
    expectedDifficulty: "Medium",
    hiringPriorities: ["Strong DSA fundamentals", "Relevant project experience", "Cultural fit", "Learning agility"],
  };
}

export async function analyzeJobDescription(
  companyName: string,
  jobRole: string,
  description: string
): Promise<JDAnalysis> {
  return generateJSON<JDAnalysis>(
    SYSTEM,
    `Analyze this job description for ${companyName} - ${jobRole}.
Return JSON: { requiredSkills[], hiddenSkills[], technicalSkills[], softSkills[], atsKeywords[],
  interviewFocus[], expectedDifficulty, hiringPriorities[] }

JD:
${description.slice(0, 10000)}`,
    fallbackJDAnalysis(companyName, jobRole)
  );
}
