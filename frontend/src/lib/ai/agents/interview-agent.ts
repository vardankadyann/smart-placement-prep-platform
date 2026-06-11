import { generateJSON } from "../client";

const SYSTEM = `You are the Interview Agent. Generate placement interview questions with sample answers and evaluation criteria.`;

export interface InterviewQuestion {
  question: string;
  type: string;
  difficulty: "easy" | "medium" | "hard";
  sampleAnswer: string;
  evaluationCriteria: string[];
  followUps: string[];
}

export interface InterviewSet {
  questions: InterviewQuestion[];
}

export function fallbackInterview(type: string, difficulty: string, count: number): InterviewSet {
  const technical = [
    { question: "Explain time complexity of binary search.", type: "technical", difficulty: "easy" as const, sampleAnswer: "Binary search runs in O(log n) because it halves the search space each iteration.", evaluationCriteria: ["Correct complexity", "Clear explanation", "Edge cases mentioned"], followUps: ["What about space complexity?", "When does binary search fail?"] },
    { question: "Design a URL shortener.", type: "technical", difficulty: "hard" as const, sampleAnswer: "Use a hash map for short-to-long URL mapping, base62 encoding, and a distributed cache for hot URLs.", evaluationCriteria: ["System components identified", "Scalability considered", "Trade-offs discussed"], followUps: ["How handle collisions?", "How scale to millions of URLs?"] },
    { question: "Explain REST vs GraphQL.", type: "technical", difficulty: "medium" as const, sampleAnswer: "REST uses multiple endpoints with fixed responses; GraphQL uses a single endpoint with client-specified queries.", evaluationCriteria: ["Both paradigms explained", "Use cases compared", "Trade-offs mentioned"], followUps: ["When prefer GraphQL?", "Caching differences?"] },
  ];
  const hr = [
    { question: "Tell me about yourself.", type: "hr", difficulty: "easy" as const, sampleAnswer: "I'm a final-year CS student passionate about backend development, with projects in Node.js and PostgreSQL.", evaluationCriteria: ["Concise structure", "Relevant to role", "Confident delivery"], followUps: ["Why this company?", "Biggest achievement?"] },
    { question: "Describe a time you handled conflict in a team.", type: "behavioral", difficulty: "medium" as const, sampleAnswer: "During a hackathon, teammates disagreed on tech stack. I facilitated a decision matrix and we chose based on team strengths.", evaluationCriteria: ["STAR format", "Specific example", "Positive outcome"], followUps: ["What would you do differently?", "How prevent future conflicts?"] },
  ];
  const pool = type === "technical" ? technical : hr;
  return { questions: pool.slice(0, count) };
}

export async function generateInterviewQuestions(
  type: string,
  difficulty: string,
  count: number,
  company?: string,
  role?: string
): Promise<InterviewSet> {
  return generateJSON<InterviewSet>(
    SYSTEM,
    `Generate ${count} ${type} interview questions at ${difficulty} difficulty${company ? ` for ${company}` : ""}${role ? ` (${role})` : ""}.
Return JSON: { questions[{ question, type, difficulty:"easy"|"medium"|"hard", sampleAnswer, evaluationCriteria[], followUps[] }] }`,
    fallbackInterview(type, difficulty, count)
  );
}
