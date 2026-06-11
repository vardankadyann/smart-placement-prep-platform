import { NextRequest } from "next/server";
import { requireDbUser } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import { roadmapSchema } from "@/lib/validations";
import { apiError, apiSuccess, parseBody } from "@/lib/api-helpers";
import prisma from "@/lib/prisma";
import { orchestrator } from "@/lib/ai/orchestrator";
import { awardXP, updateStreak } from "@/lib/services/xp";

export async function POST(request: NextRequest) {
  try {
    const user = await requireDbUser();
    const limited = rateLimit(`roadmap:${user.id}`);
    if (!limited.success) return apiError("Rate limit exceeded", 429);

    const body = await parseBody<unknown>(request);
    const parsed = roadmapSchema.safeParse(body);
    if (!parsed.success) return apiError("Invalid roadmap request");

    const { duration, resumeId, jobDescriptionId, skillGapId } = parsed.data;

    let resumeData: Record<string, unknown> | undefined;
    let jdData: Record<string, unknown> | undefined;
    let gaps: string[] = [];

    if (resumeId) {
      const resume = await prisma.resume.findFirst({ where: { id: resumeId, userId: user.id } });
      resumeData = resume?.extractedData as Record<string, unknown>;
    }
    if (jobDescriptionId) {
      const jd = await prisma.jobDescription.findFirst({ where: { id: jobDescriptionId, userId: user.id } });
      jdData = { ...(jd?.analysisData as object), jobRole: jd?.jobRole, hiringPriorities: jd?.hiringPriorities };
    }
    if (skillGapId) {
      const gap = await prisma.skillGapAnalysis.findFirst({ where: { id: skillGapId, userId: user.id } });
      gaps = gap?.missingTechnical ?? [];
    }

    const roadmap = await orchestrator.roadmap.generate(duration, { resume: resumeData, jd: jdData, gaps });

    const saved = await prisma.roadmap.create({
      data: {
        userId: user.id,
        jobDescriptionId: jobDescriptionId ?? null,
        duration,
        title: roadmap.title,
        weeks: roadmap.weeks as object,
        expectedOutcomes: roadmap.expectedOutcomes,
      },
    });

    await awardXP(user.id, 45, `${duration}-day roadmap generated`);
    await updateStreak(user.id);

    return apiSuccess({ roadmap: saved });
  } catch (e) {
    return apiError(e instanceof Error ? e.message : "Roadmap generation failed", 500);
  }
}

export async function GET() {
  try {
    const user = await requireDbUser();
    const roadmaps = await prisma.roadmap.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });
    return apiSuccess({ roadmaps });
  } catch {
    return apiError("Unauthorized", 401);
  }
}
