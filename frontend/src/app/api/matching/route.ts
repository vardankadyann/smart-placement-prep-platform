import { NextRequest } from "next/server";
import { requireDbUser } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import { matchingSchema } from "@/lib/validations";
import { apiError, apiSuccess, parseBody } from "@/lib/api-helpers";
import prisma from "@/lib/prisma";
import { orchestrator } from "@/lib/ai/orchestrator";
import { awardXP, updateStreak } from "@/lib/services/xp";

export async function POST(request: NextRequest) {
  try {
    const user = await requireDbUser();
    const limited = rateLimit(`match:${user.id}`);
    if (!limited.success) return apiError("Rate limit exceeded", 429);

    const body = await parseBody<unknown>(request);
    const parsed = matchingSchema.safeParse(body);
    if (!parsed.success) return apiError("Invalid resume or job ID");

    const [resume, jd] = await Promise.all([
      prisma.resume.findFirst({ where: { id: parsed.data.resumeId, userId: user.id } }),
      prisma.jobDescription.findFirst({ where: { id: parsed.data.jobDescriptionId, userId: user.id } }),
    ]);

    if (!resume || !jd) return apiError("Resume or job description not found", 404);

    const match = await orchestrator.evaluation.match(
      (resume.extractedData as Record<string, unknown>) ?? { skills: resume.strengths },
      { ...jd.analysisData as object, requiredSkills: jd.requiredSkills, jobRole: jd.jobRole }
    );

    const result = await prisma.resumeJdMatch.create({
      data: {
        userId: user.id,
        resumeId: resume.id,
        jobDescriptionId: jd.id,
        matchScore: match.matchScore,
        strongMatches: match.strongMatches,
        partialMatches: match.partialMatches,
        missingSkills: match.missingSkills,
        missingProjects: match.missingProjects,
        missingKeywords: match.missingKeywords,
        improvementSuggestions: match.improvementSuggestions,
        selectionProbability: match.selectionProbability,
        analysisData: match as object,
      },
    });

    await awardXP(user.id, 40, "Resume-JD match completed");
    await updateStreak(user.id);

    return apiSuccess({ match: result, analysis: match });
  } catch (e) {
    return apiError(e instanceof Error ? e.message : "Matching failed", 500);
  }
}

export async function GET() {
  try {
    const user = await requireDbUser();
    const matches = await prisma.resumeJdMatch.findMany({
      where: { userId: user.id },
      include: { resume: true, jobDescription: true },
      orderBy: { createdAt: "desc" },
      take: 20,
    });
    return apiSuccess({ matches });
  } catch {
    return apiError("Unauthorized", 401);
  }
}
