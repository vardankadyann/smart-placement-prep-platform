import { generateJSON } from "../client";

const SYSTEM = `You are the Roadmap Agent. Create structured learning roadmaps for placement preparation.`;

export interface RoadmapWeek {
  weekNumber: number;
  topics: string[];
  resources: { title: string; type: string; url?: string }[];
  practiceQuestions: string[];
  miniProjects: string[];
  milestones: string[];
}

export interface RoadmapResult {
  title: string;
  weeks: RoadmapWeek[];
  expectedOutcomes: string[];
}

function buildFallbackWeeks(duration: number, gaps: string[]): RoadmapWeek[] {
  const weeks: RoadmapWeek[] = [];
  const weekCount = Math.ceil(duration / 7);
  for (let i = 1; i <= weekCount; i++) {
    const gap = gaps[(i - 1) % gaps.length] ?? "DSA Practice";
    weeks.push({
      weekNumber: i,
      topics: [gap, "Mock Interview Prep", "Resume Refinement"],
      resources: [
        { title: `${gap} - Striver Sheet`, type: "Practice" },
        { title: "LeetCode Daily Challenge", type: "Coding" },
        { title: "GeeksforGeeks Articles", type: "Reading" },
      ],
      practiceQuestions: [`Solve 10 ${gap} problems`, "1 mock HR question daily"],
      miniProjects: [`Build a mini project applying ${gap}`],
      milestones: [`Complete Week ${i} assessment`, `Score 70%+ on practice quiz`],
    });
  }
  return weeks;
}

export function fallbackRoadmap(duration: number, gaps: string[]): RoadmapResult {
  return {
    title: `${duration}-Day Placement Preparation Roadmap`,
    weeks: buildFallbackWeeks(duration, gaps.length ? gaps : ["Arrays", "Trees", "Dynamic Programming"]),
    expectedOutcomes: [
      "Strong DSA foundation for coding rounds",
      "Polished resume aligned with target roles",
      "Confident mock interview performance",
      "Improved placement readiness score by 20+ points",
    ],
  };
}

export async function generateRoadmap(
  duration: number,
  context: { resume?: Record<string, unknown>; jd?: Record<string, unknown>; gaps?: string[] }
): Promise<RoadmapResult> {
  const gaps = context.gaps ?? ["System Design", "Advanced DSA", "SQL"];

  return generateJSON<RoadmapResult>(
    SYSTEM,
    `Create a ${duration}-day placement roadmap (${Math.ceil(duration / 7)} weeks).
Return JSON: { title, weeks[{weekNumber,topics[],resources[{title,type,url}],practiceQuestions[],miniProjects[],milestones[]}], expectedOutcomes[] }

Context:
Resume skills: ${JSON.stringify(context.resume?.skills ?? [])}
Target role: ${JSON.stringify(context.jd?.jobRole ?? "Software Engineer")}
Skill gaps: ${JSON.stringify(gaps)}
JD priorities: ${JSON.stringify(context.jd?.hiringPriorities ?? [])}`,
    fallbackRoadmap(duration, gaps)
  );
}
