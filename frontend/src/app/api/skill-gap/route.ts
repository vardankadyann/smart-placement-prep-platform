import { NextRequest } from "next/server";
import { requireDbUser } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import { skillGapSchema } from "@/lib/validations";
import { apiError, apiSuccess, parseBody } from "@/lib/api-helpers";
import prisma from "@/lib/prisma";
import { orchestrator } from "@/lib/ai/orchestrator";
import { awardXP, updateStreak } from "@/lib/services/xp";

export async function POST(request: NextRequest) {
  try {
    const user = await requireDbUser();
    const limited = rateLimit(`gap:${user.id}`);
    if (!limited.success) return apiError("Rate limit exceeded", 429);

    const body = await parseBody<unknown>(request);
    const parsed = skillGapSchema.safeParse(body);
    if (!parsed.success) return apiError("jobDescriptionId required");

    const jd = await prisma.jobDescription.findFirst({
      where: { id: parsed.data.jobDescriptionId, userId: user.id },
    });
    if (!jd) return apiError("Job description not found", 404);

    let resumeData: Record<string, unknown> = {};
    if (parsed.data.resumeId) {
      const resume = await prisma.resume.findFirst({
        where: { id: parsed.data.resumeId, userId: user.id },
      });
      resumeData = (resume?.extractedData as Record<string, unknown>) ?? {};
    } else {
      const profile = await prisma.profile.findUnique({ where: { userId: user.id } });
      resumeData = { skills: profile?.skills ?? [] };
    }

    const analysis = await orchestrator.skillGap.analyze(resumeData, {
      requiredSkills: jd.requiredSkills,
      technicalSkills: jd.technicalSkills,
      hiringPriorities: jd.hiringPriorities,
    });

    const result = await prisma.skillGapAnalysis.create({
      data: {
        userId: user.id,
        jobDescriptionId: jd.id,
        gapScore: analysis.gapScore,
        missingTechnical: analysis.missingTechnical,
        missingSoft: analysis.missingSoft,
        missingCertifications: analysis.missingCertifications,
        missingProjects: analysis.missingProjects,
        learningPriorities: analysis.learningPriorities as object,
        analysisData: analysis as object,
      },
    });

    await prisma.progressTracking.create({
      data: { userId: user.id, category: "skill-gap", metric: "score", value: analysis.gapScore },
    });

    await awardXP(user.id, 35, "Skill gap analysis completed");
    await updateStreak(user.id);

    return apiSuccess({ analysis: result });
  } catch (e) {
    return apiError(e instanceof Error ? e.message : "Analysis failed", 500);
  }
}

export async function GET() {
  try {
    const user = await requireDbUser();
    const analyses = await prisma.skillGapAnalysis.findMany({
      where: { userId: user.id },
      include: { jobDescription: true },
      orderBy: { createdAt: "desc" },
      take: 10,
    });
    return apiSuccess({ analyses });
  } catch {
    return apiError("Unauthorized", 401);
  }
}
