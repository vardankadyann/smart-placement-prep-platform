import { NextRequest } from "next/server";
import { requireDbUser } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import { voiceInterviewSchema } from "@/lib/validations";
import { apiError, apiSuccess, parseBody } from "@/lib/api-helpers";
import prisma from "@/lib/prisma";
import { orchestrator } from "@/lib/ai/orchestrator";
import { awardXP, grantAchievement, updateStreak } from "@/lib/services/xp";

export async function POST(request: NextRequest) {
  try {
    const user = await requireDbUser();
    const limited = rateLimit(`voice:${user.id}`);
    if (!limited.success) return apiError("Rate limit exceeded", 429);

    const body = await parseBody<unknown>(request);
    const parsed = voiceInterviewSchema.safeParse(body);
    if (!parsed.success) return apiError("Invalid voice interview data");

    const evaluation = await orchestrator.evaluation.voice(parsed.data.question, parsed.data.transcript);

    const result = await prisma.voiceInterview.create({
      data: {
        userId: user.id,
        question: parsed.data.question,
        transcript: parsed.data.transcript,
        communicationScore: evaluation.communicationScore,
        confidenceScore: evaluation.confidenceScore,
        technicalScore: evaluation.technicalScore,
        clarityScore: evaluation.clarityScore,
        overallScore: evaluation.overallScore,
        feedback: evaluation.feedback,
        suggestedAnswer: evaluation.suggestedAnswer,
        evaluationData: evaluation as object,
      },
    });

    await prisma.progressTracking.create({
      data: { userId: user.id, category: "interview", metric: "voice-score", value: evaluation.overallScore },
    });

    await awardXP(user.id, 30, "Voice mock interview completed");
    await updateStreak(user.id);

    const count = await prisma.voiceInterview.count({ where: { userId: user.id } });
    if (count >= 10) await grantAchievement(user.id, "interview-champion");

    return apiSuccess({ result, evaluation });
  } catch (e) {
    return apiError(e instanceof Error ? e.message : "Evaluation failed", 500);
  }
}

export async function GET() {
  try {
    const user = await requireDbUser();
    const results = await prisma.voiceInterview.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 20,
    });
    return apiSuccess({ results });
  } catch {
    return apiError("Unauthorized", 401);
  }
}
