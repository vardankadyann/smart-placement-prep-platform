import { z } from "zod";

export const profileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  college: z.string().min(2).max(200),
  branch: z.string().min(2).max(100),
  year: z.string().min(1).max(20),
  cgpa: z.number().min(0).max(10).optional(),
  skills: z.array(z.string()).default([]),
  preferredRoles: z.array(z.string()).default([]),
  preferredCompanies: z.array(z.string()).default([]),
});

export const jobDescriptionSchema = z.object({
  companyName: z.string().min(1).max(200),
  jobRole: z.string().min(1).max(200),
  description: z.string().min(50).max(15000),
});

export const matchingSchema = z.object({
  resumeId: z.string().cuid(),
  jobDescriptionId: z.string().cuid(),
});

export const skillGapSchema = z.object({
  resumeId: z.string().cuid().optional(),
  jobDescriptionId: z.string().cuid(),
});

export const roadmapSchema = z.object({
  duration: z.enum(["30", "60", "90"]).transform(Number),
  resumeId: z.string().cuid().optional(),
  jobDescriptionId: z.string().cuid().optional(),
  skillGapId: z.string().cuid().optional(),
});

export const interviewSchema = z.object({
  type: z.enum(["technical", "hr", "behavioral", "company"]),
  difficulty: z.enum(["easy", "medium", "hard"]).default("medium"),
  company: z.string().optional(),
  role: z.string().optional(),
  count: z.number().min(1).max(20).default(5),
});

export const codingSchema = z.object({
  category: z.enum([
    "arrays", "strings", "linked-list", "stack", "queue",
    "trees", "graphs", "dp", "sql",
  ]),
  difficulty: z.enum(["easy", "medium", "hard"]).default("medium"),
});

export const codingSubmitSchema = z.object({
  testId: z.string().cuid(),
  code: z.string().min(1).max(50000),
  language: z.string().default("python"),
});

export const aptitudeSchema = z.object({
  category: z.enum(["quantitative", "logical", "verbal"]),
  company: z.string().optional(),
  count: z.number().min(5).max(20).default(10),
});

export const behavioralSchema = z.object({
  question: z.string().min(10).max(2000),
  answer: z.string().min(20).max(10000),
});

export const mentorSchema = z.object({
  message: z.string().min(1).max(4000),
  sessionId: z.string().optional(),
});

export const voiceInterviewSchema = z.object({
  question: z.string().min(10).max(2000),
  transcript: z.string().min(5).max(10000),
});

export type ProfileInput = z.infer<typeof profileSchema>;
export type JobDescriptionInput = z.infer<typeof jobDescriptionSchema>;
