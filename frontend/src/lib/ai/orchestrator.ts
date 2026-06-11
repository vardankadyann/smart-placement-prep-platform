import { analyzeResume } from "./agents/resume-agent";
import { analyzeJobDescription } from "./agents/jd-agent";
import { analyzeSkillGap } from "./agents/skill-gap-agent";
import { generateRoadmap } from "./agents/roadmap-agent";
import { generateInterviewQuestions } from "./agents/interview-agent";
import { generateCodingProblem, evaluateCode } from "./agents/coding-agent";
import {
  evaluateVoiceAnswer,
  evaluateBehavioralAnswer,
  evaluateResumeJdMatch,
  generateAptitudeQuestions,
} from "./agents/evaluation-agent";

export type AgentType =
  | "resume"
  | "jd"
  | "skill-gap"
  | "roadmap"
  | "interview"
  | "coding"
  | "evaluation";

export const orchestrator = {
  resume: { analyze: analyzeResume },
  jd: { analyze: analyzeJobDescription },
  skillGap: { analyze: analyzeSkillGap },
  roadmap: { generate: generateRoadmap },
  interview: { generate: generateInterviewQuestions },
  coding: { generate: generateCodingProblem, evaluate: evaluateCode },
  evaluation: {
    voice: evaluateVoiceAnswer,
    behavioral: evaluateBehavioralAnswer,
    match: evaluateResumeJdMatch,
    aptitude: generateAptitudeQuestions,
  },
};

type OrchestratorKey = keyof typeof orchestrator;

function resolveAgentKey(agent: AgentType): OrchestratorKey {
  if (agent === "skill-gap") return "skillGap";
  return agent;
}

export async function runAgent<T>(
  agent: AgentType,
  action: string,
  ...args: unknown[]
): Promise<T> {
  const agentModule = orchestrator[resolveAgentKey(agent)] as unknown as Record<string, (...a: unknown[]) => Promise<T>>;
  const fn = agentModule[action];
  if (!fn) throw new Error(`Unknown action ${action} for agent ${agent}`);
  return fn(...args);
}
