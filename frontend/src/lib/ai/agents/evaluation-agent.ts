import { generateJSON } from "../client";

const SYSTEM = `You are the Evaluation Agent. Evaluate student responses across interviews, voice answers, and behavioral assessments.`;

export interface VoiceEvaluation {
  communicationScore: number;
  confidenceScore: number;
  technicalScore: number;
  clarityScore: number;
  overallScore: number;
  feedback: string;
  suggestedAnswer: string;
}

export interface BehavioralEvaluation {
  starScores: { situation: number; task: number; action: number; result: number };
  overallScore: number;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
}

export interface MatchEvaluation {
  matchScore: number;
  strongMatches: string[];
  partialMatches: string[];
  missingSkills: string[];
  missingProjects: string[];
  missingKeywords: string[];
  improvementSuggestions: string[];
  selectionProbability: number;
}

export function fallbackVoiceEval(): VoiceEvaluation {
  return {
    communicationScore: 72,
    confidenceScore: 68,
    technicalScore: 75,
    clarityScore: 70,
    overallScore: 71,
    feedback: "Good structure overall. Add more specific examples and reduce filler words.",
    suggestedAnswer: "Lead with a concise summary, support with 2-3 specific examples, and end with a clear takeaway relevant to the role.",
  };
}

export function fallbackBehavioralEval(): BehavioralEvaluation {
  return {
    starScores: { situation: 70, task: 65, action: 75, result: 60 },
    overallScore: 68,
    strengths: ["Clear action steps", "Relevant example chosen"],
    weaknesses: ["Situation context too brief", "Result lacks quantifiable impact"],
    suggestions: ["Add metrics to the result", "Set up the situation with team size and timeline", "Use 'I' statements for your specific contributions"],
  };
}

export async function evaluateVoiceAnswer(question: string, transcript: string): Promise<VoiceEvaluation> {
  return generateJSON<VoiceEvaluation>(
    SYSTEM,
    `Evaluate this spoken interview answer.
Question: ${question}
Transcript: ${transcript}

Return JSON: { communicationScore, confidenceScore, technicalScore, clarityScore, overallScore (all 0-100), feedback, suggestedAnswer }`,
    fallbackVoiceEval()
  );
}

export async function evaluateBehavioralAnswer(question: string, answer: string): Promise<BehavioralEvaluation> {
  return generateJSON<BehavioralEvaluation>(
    SYSTEM,
    `Evaluate using STAR framework.
Question: ${question}
Answer: ${answer}

Return JSON: { starScores{situation,task,action,result (0-100 each)}, overallScore, strengths[], weaknesses[], suggestions[] }`,
    fallbackBehavioralEval()
  );
}

export async function evaluateResumeJdMatch(
  resumeData: Record<string, unknown>,
  jdData: Record<string, unknown>
): Promise<MatchEvaluation> {
  return generateJSON<MatchEvaluation>(
    SYSTEM,
    `Compare resume against job description.
Resume: ${JSON.stringify(resumeData).slice(0, 5000)}
JD: ${JSON.stringify(jdData).slice(0, 5000)}

Return JSON: { matchScore(0-100), strongMatches[], partialMatches[], missingSkills[], missingProjects[], missingKeywords[], improvementSuggestions[], selectionProbability(0-100) }`,
    {
      matchScore: 65,
      strongMatches: ["Python", "Problem Solving"],
      partialMatches: ["JavaScript (basic)"],
      missingSkills: ["System Design", "Kubernetes"],
      missingProjects: ["Distributed systems project"],
      missingKeywords: ["Microservices", "CI/CD"],
      improvementSuggestions: ["Add cloud project", "Highlight leadership in team projects"],
      selectionProbability: 45,
    }
  );
}

export async function generateAptitudeQuestions(
  category: string,
  company: string | undefined,
  count: number
) {
  return generateJSON<{ questions: { question: string; options: string[]; correctIndex: number; explanation: string }[] }>(
    SYSTEM,
    `Generate ${count} ${category} aptitude questions${company ? ` styled for ${company}` : ""}.
Return JSON: { questions[{ question, options[4 strings], correctIndex(0-3), explanation }] }`,
    {
      questions: Array.from({ length: Math.min(count, 10) }, (_, i) => ({
        question: `Sample ${category} question ${i + 1}: If A completes work in 10 days and B in 15 days, how long together?`,
        options: ["6 days", "8 days", "5 days", "12 days"],
        correctIndex: 0,
        explanation: "Combined rate = 1/10 + 1/15 = 1/6, so 6 days.",
      })),
    }
  );
}
