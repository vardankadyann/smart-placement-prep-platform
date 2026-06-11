import { NextRequest } from "next/server";
import { requireDbUser } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import { codingSchema, codingSubmitSchema } from "@/lib/validations";
import { apiError, apiSuccess, parseBody } from "@/lib/api-helpers";
import prisma from "@/lib/prisma";
import { orchestrator } from "@/lib/ai/orchestrator";
import { submitToJudge0 } from "@/lib/services/judge0";
import { awardXP, grantAchievement, updateStreak } from "@/lib/services/xp";

export async function POST(request: NextRequest) {
  try {
    const user = await requireDbUser();
    const limited = rateLimit(`coding:${user.id}`);
    if (!limited.success) return apiError("Rate limit exceeded", 429);

    const body = await parseBody<unknown>(request);
    const action = (body as { action?: string })?.action;

    if (action === "submit") {
      const parsed = codingSubmitSchema.safeParse(body);
      if (!parsed.success) return apiError("Invalid submission");

      const test = await prisma.codingTest.findFirst({
        where: { id: parsed.data.testId, userId: user.id },
      });
      if (!test) return apiError("Test not found", 404);

      const testCases = test.testCases as { input: string; expectedOutput: string }[] | null;
      const judgeResult = await submitToJudge0(
        parsed.data.code,
        parsed.data.language,
        testCases?.[0]?.input
      );

      const aiEval = await orchestrator.coding.evaluate(
        parsed.data.code,
        test.description,
        parsed.data.language
      );

      const score = judgeResult.passed ? aiEval.score : Math.max(0, aiEval.score - 30);

      const result = await prisma.codingResult.create({
        data: {
          codingTestId: test.id,
          code: parsed.data.code,
          language: parsed.data.language,
          passed: judgeResult.passed && aiEval.passed,
          score,
          timeComplexity: aiEval.timeComplexity,
          spaceComplexity: aiEval.spaceComplexity,
          judgeOutput: judgeResult as object,
          aiFeedback: aiEval.feedback,
        },
      });

      await prisma.progressTracking.create({
        data: { userId: user.id, category: "coding", metric: "score", value: score },
      });

      await awardXP(user.id, Math.round(score / 2), "Coding challenge completed");
      await updateStreak(user.id);

      const solved = await prisma.codingResult.count({ where: { codingTest: { userId: user.id }, passed: true } });
      if (solved >= 50) await grantAchievement(user.id, "dsa-master");

      return apiSuccess({ result, judgeResult, aiEval });
    }

    const parsed = codingSchema.safeParse(body);
    if (!parsed.success) return apiError("Invalid coding request");

    const problem = await orchestrator.coding.generate(parsed.data.category, parsed.data.difficulty);

    const test = await prisma.codingTest.create({
      data: {
        userId: user.id,
        category: parsed.data.category,
        difficulty: parsed.data.difficulty,
        title: problem.title,
        description: problem.description,
        starterCode: problem.starterCode,
        testCases: problem.testCases as object,
        hints: problem.hints,
      },
    });

    return apiSuccess({ test, problem });
  } catch (e) {
    return apiError(e instanceof Error ? e.message : "Coding failed", 500);
  }
}

export async function GET() {
  try {
    const user = await requireDbUser();
    const tests = await prisma.codingTest.findMany({
      where: { userId: user.id },
      include: { results: { take: 1, orderBy: { createdAt: "desc" } } },
      orderBy: { createdAt: "desc" },
      take: 20,
    });
    return apiSuccess({ tests });
  } catch {
    return apiError("Unauthorized", 401);
  }
}
