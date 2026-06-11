import { generateJSON } from "../client";

const SYSTEM = `You are the Skill Gap Agent. Compare candidate profile against job requirements and identify gaps with prioritized learning paths.`;

export interface SkillGapResult {
  gapScore: number;
  missingTechnical: string[];
  missingSoft: string[];
  missingCertifications: string[];
  missingProjects: string[];
  learningPriorities: { skill: string; priority: "critical" | "high" | "medium" | "low"; reason: string }[];
}

export function fallbackSkillGap(resumeSkills: string[], jdSkills: string[]): SkillGapResult {
  const resumeSet = new Set(resumeSkills.map((s) => s.toLowerCase()));
  const missing = jdSkills.filter((s) => !resumeSet.has(s.toLowerCase()));
  return {
    gapScore: Math.max(20, 100 - missing.length * 12),
    missingTechnical: missing.length ? missing : ["System Design", "Advanced DSA"],
    missingSoft: ["Leadership", "Cross-functional Communication"],
    missingCertifications: ["AWS Cloud Practitioner", "SQL Certification"],
    missingProjects: ["Microservices project", "Open source contribution"],
    learningPriorities: [
      { skill: missing[0] ?? "System Design", priority: "critical", reason: "Required by JD and absent from resume" },
      { skill: "Behavioral Interview Prep", priority: "high", reason: "Essential for final rounds" },
      { skill: "SQL Optimization", priority: "medium", reason: "Differentiator for backend roles" },
      { skill: "Cloud Basics", priority: "low", reason: "Nice-to-have for most fresher roles" },
    ],
  };
}

export async function analyzeSkillGap(
  resumeData: Record<string, unknown>,
  jdData: Record<string, unknown>
): Promise<SkillGapResult> {
  const resumeSkills = (resumeData.skills as string[]) ?? [];
  const jdSkills = [
    ...((jdData.requiredSkills as string[]) ?? []),
    ...((jdData.technicalSkills as string[]) ?? []),
  ];

  return generateJSON<SkillGapResult>(
    SYSTEM,
    `Compare resume vs JD and return JSON:
{ gapScore(0-100, higher=better alignment), missingTechnical[], missingSoft[], missingCertifications[],
  missingProjects[], learningPriorities[{skill,priority:"critical"|"high"|"medium"|"low",reason}] }

Resume skills: ${JSON.stringify(resumeSkills)}
Resume projects: ${JSON.stringify(resumeData.projects ?? [])}
JD required: ${JSON.stringify(jdSkills)}
JD priorities: ${JSON.stringify(jdData.hiringPriorities ?? [])}`,
    fallbackSkillGap(resumeSkills, jdSkills)
  );
}
