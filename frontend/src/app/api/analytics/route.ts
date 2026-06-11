import { requireDbUser } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/api-helpers";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const user = await requireDbUser();

    const [
      profile,
      progress,
      resumes,
      skillGaps,
      codingResults,
      voiceInterviews,
      aptitudeTests,
      roadmaps,
    ] = await Promise.all([
      prisma.profile.findUnique({ where: { userId: user.id } }),
      prisma.progressTracking.findMany({
        where: { userId: user.id },
        orderBy: { recordedAt: "asc" },
        take: 100,
      }),
      prisma.resume.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "asc" },
        select: { resumeScore: true, atsScore: true, createdAt: true },
      }),
      prisma.skillGapAnalysis.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      prisma.codingResult.findMany({
        where: { codingTest: { userId: user.id } },
        orderBy: { createdAt: "desc" },
        take: 20,
        select: { score: true, passed: true, createdAt: true },
      }),
      prisma.voiceInterview.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        take: 20,
        select: { overallScore: true, createdAt: true },
      }),
      prisma.aptitudeTest.findMany({
        where: { userId: user.id, score: { not: null } },
        orderBy: { createdAt: "desc" },
        take: 20,
        select: { score: true, category: true, createdAt: true },
      }),
      prisma.roadmap.findMany({
        where: { userId: user.id },
        select: { title: true, completionPct: true, duration: true, status: true },
      }),
    ]);

    const skillDistribution = (profile?.skills ?? []).map((skill) => ({
      skill,
      value: 1,
    }));

    const progressOverTime = progress.reduce<
      Record<string, { date: string; scores: number[] }>
    >((acc, p) => {
      const date = p.recordedAt.toISOString().split("T")[0];
      if (!acc[date]) acc[date] = { date, scores: [] };
      acc[date].scores.push(p.value);
      return acc;
    }, {});

    const progressChart = Object.values(progressOverTime).map((d) => ({
      date: d.date,
      score: Math.round(d.scores.reduce((a, b) => a + b, 0) / d.scores.length),
    }));

    return apiSuccess({
      skillDistribution,
      skillGaps: skillGaps.map((g) => ({
        score: g.gapScore,
        missing: g.missingTechnical.length + g.missingSoft.length,
        date: g.createdAt,
      })),
      progressOverTime: progressChart,
      resumeTrends: resumes.map((r) => ({
        date: r.createdAt.toISOString().split("T")[0],
        resumeScore: r.resumeScore,
        atsScore: r.atsScore,
      })),
      codingPerformance: codingResults,
      interviewPerformance: voiceInterviews,
      aptitudePerformance: aptitudeTests,
      roadmapCompletion: roadmaps,
    });
  } catch {
    return apiError("Unauthorized", 401);
  }
}
