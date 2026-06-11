import { NextRequest } from "next/server";
import { requireDbUser } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import { interviewSchema } from "@/lib/validations";
import { apiError, apiSuccess, parseBody } from "@/lib/api-helpers";
import prisma from "@/lib/prisma";
import { orchestrator } from "@/lib/ai/orchestrator";
import { awardXP, grantAchievement, updateStreak } from "@/lib/services/xp";

export async function POST(request: NextRequest) {
  try {
    const user = await requireDbUser();
    const limited = rateLimit(`interview:${user.id}`);
    if (!limited.success) return apiError("Rate limit exceeded", 429);

    const body = await parseBody<unknown>(request);
    const parsed = interviewSchema.safeParse(body);
    if (!parsed.success) return apiError("Invalid interview request");

    const { type, difficulty, company, role, count } = parsed.data;
    const result = await orchestrator.interview.generate(type, difficulty, count, company, role);

    const interview = await prisma.interview.create({
      data: {
        userId: user.id,
        type,
        company,
        role,
        difficulty,
        questions: result.questions as object,
      },
    });

    await awardXP(user.id, 20 * count, "Mock interview generated");
    await updateStreak(user.id);

    return apiSuccess({ interview, questions: result.questions });
  } catch (e) {
    return apiError(e instanceof Error ? e.message : "Failed", 500);
  }
}

export async function GET() {
  try {
    const user = await requireDbUser();
    const interviews = await prisma.interview.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 20,
    });
    return apiSuccess({ interviews });
  } catch {
    return apiError("Unauthorized", 401);
  }
}
