import { NextRequest } from "next/server";
import { requireDbUser } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import { behavioralSchema } from "@/lib/validations";
import { apiError, apiSuccess, parseBody } from "@/lib/api-helpers";
import prisma from "@/lib/prisma";
import { orchestrator } from "@/lib/ai/orchestrator";
import { awardXP, updateStreak } from "@/lib/services/xp";

export async function POST(request: NextRequest) {
  try {
    const user = await requireDbUser();
    const limited = rateLimit(`behavioral:${user.id}`);
    if (!limited.success) return apiError("Rate limit exceeded", 429);

    const body = await parseBody<unknown>(request);
    const parsed = behavioralSchema.safeParse(body);
    if (!parsed.success) return apiError("Invalid behavioral data");

    const evaluation = await orchestrator.evaluation.behavioral(parsed.data.question, parsed.data.answer);

    const result = await prisma.behavioralTest.create({
      data: {
        userId: user.id,
        question: parsed.data.question,
        answer: parsed.data.answer,
        starScores: evaluation.starScores as object,
        overallScore: evaluation.overallScore,
        strengths: evaluation.strengths,
        weaknesses: evaluation.weaknesses,
        suggestions: evaluation.suggestions,
      },
    });

    await prisma.progressTracking.create({
      data: { userId: user.id, category: "behavioral", metric: "score", value: evaluation.overallScore },
    });

    await awardXP(user.id, 25, "Behavioral answer evaluated");
    await updateStreak(user.id);

    return apiSuccess({ result, evaluation });
  } catch (e) {
    return apiError(e instanceof Error ? e.message : "Evaluation failed", 500);
  }
}

export async function GET() {
  try {
    const user = await requireDbUser();
    const tests = await prisma.behavioralTest.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 20,
    });
    return apiSuccess({ tests });
  } catch {
    return apiError("Unauthorized", 401);
  }
}
