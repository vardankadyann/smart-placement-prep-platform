import { NextRequest } from "next/server";
import { requireDbUser } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import { jobDescriptionSchema } from "@/lib/validations";
import { apiError, apiSuccess, parseBody } from "@/lib/api-helpers";
import prisma from "@/lib/prisma";
import { orchestrator } from "@/lib/ai/orchestrator";
import { awardXP, updateStreak } from "@/lib/services/xp";

export async function GET() {
  try {
    const user = await requireDbUser();
    const jobs = await prisma.jobDescription.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });
    return apiSuccess({ jobs });
  } catch {
    return apiError("Unauthorized", 401);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireDbUser();
    const limited = rateLimit(`jd:${user.id}`);
    if (!limited.success) return apiError("Rate limit exceeded", 429);

    const body = await parseBody<unknown>(request);
    const parsed = jobDescriptionSchema.safeParse(body);
    if (!parsed.success) return apiError(parsed.error.errors[0]?.message ?? "Invalid input");

    const { companyName, jobRole, description } = parsed.data;
    const analysis = await orchestrator.jd.analyze(companyName, jobRole, description);

    const job = await prisma.jobDescription.create({
      data: {
        userId: user.id,
        companyName,
        jobRole,
        description,
        requiredSkills: analysis.requiredSkills,
        hiddenSkills: analysis.hiddenSkills,
        technicalSkills: analysis.technicalSkills,
        softSkills: analysis.softSkills,
        atsKeywords: analysis.atsKeywords,
        interviewFocus: analysis.interviewFocus,
        expectedDifficulty: analysis.expectedDifficulty,
        hiringPriorities: analysis.hiringPriorities,
        analysisData: analysis as object,
      },
    });

    await awardXP(user.id, 30, "Job description analyzed");
    await updateStreak(user.id);

    return apiSuccess({ job, analysis });
  } catch (e) {
    return apiError(e instanceof Error ? e.message : "Analysis failed", 500);
  }
}
