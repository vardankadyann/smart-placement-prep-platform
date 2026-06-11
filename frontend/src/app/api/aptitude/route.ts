import { NextRequest } from "next/server";
import { requireDbUser } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import { aptitudeSchema } from "@/lib/validations";
import { apiError, apiSuccess, parseBody } from "@/lib/api-helpers";
import prisma from "@/lib/prisma";
import { orchestrator } from "@/lib/ai/orchestrator";
import { awardXP, grantAchievement, updateStreak } from "@/lib/services/xp";

export async function POST(request: NextRequest) {
  try {
    const user = await requireDbUser();
    const limited = rateLimit(`aptitude:${user.id}`);
    if (!limited.success) return apiError("Rate limit exceeded", 429);

    const body = await parseBody<unknown>(request);
    const action = (body as { action?: string })?.action;

    if (action === "submit") {
      const { testId, answers } = body as { testId: string; answers: number[] };
      const test = await prisma.aptitudeTest.findFirst({ where: { id: testId, userId: user.id } });
      if (!test) return apiError("Test not found", 404);

      const questions = test.questions as { correctIndex: number }[];
      let correct = 0;
      questions.forEach((q, i) => {
        if (answers[i] === q.correctIndex) correct++;
      });
      const score = Math.round((correct / questions.length) * 100);

      const updated = await prisma.aptitudeTest.update({
        where: { id: testId },
        data: { answers: answers as object, score, correctAnswers: correct },
      });

      await prisma.progressTracking.create({
        data: { userId: user.id, category: "aptitude", metric: "score", value: score },
      });

      await awardXP(user.id, Math.round(score / 3), "Aptitude test completed");
      await updateStreak(user.id);
      if (score >= 90) await grantAchievement(user.id, "aptitude-ace");

      return apiSuccess({ test: updated, score, correct, total: questions.length });
    }

    const parsed = aptitudeSchema.safeParse(body);
    if (!parsed.success) return apiError("Invalid aptitude request");

    const generated = await orchestrator.evaluation.aptitude(
      parsed.data.category,
      parsed.data.company,
      parsed.data.count
    );

    const test = await prisma.aptitudeTest.create({
      data: {
        userId: user.id,
        category: parsed.data.category,
        company: parsed.data.company,
        questions: generated.questions as object,
        totalQuestions: generated.questions.length,
      },
    });

    return apiSuccess({ test, questions: generated.questions });
  } catch (e) {
    return apiError(e instanceof Error ? e.message : "Aptitude failed", 500);
  }
}

export async function GET() {
  try {
    const user = await requireDbUser();
    const tests = await prisma.aptitudeTest.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 20,
    });
    return apiSuccess({ tests });
  } catch {
    return apiError("Unauthorized", 401);
  }
}
