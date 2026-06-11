import { requireDbUser } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/api-helpers";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const user = await requireDbUser();

    const [
      profile,
      latestResume,
      codingResults,
      voiceInterviews,
      aptitudeTests,
      progress,
      roadmaps,
    ] = await Promise.all([
      prisma.profile.findUnique({ where: { userId: user.id } }),
      prisma.resume.findFirst({ where: { userId: user.id }, orderBy: { createdAt: "desc" } }),
      prisma.codingResult.findMany({
        where: { codingTest: { userId: user.id } },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
      prisma.voiceInterview.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
      prisma.aptitudeTest.findMany({
        where: { userId: user.id, score: { not: null } },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
      prisma.progressTracking.findMany({
        where: { userId: user.id },
        orderBy: { recordedAt: "desc" },
        take: 50,
      }),
      prisma.roadmap.findMany({ where: { userId: user.id } }),
    ]);

    const avg = (vals: number[]) => (vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0);

    const technicalSkills = profile?.readinessScore ?? 40;
    const resume = latestResume?.resumeScore ?? 0;
    const coding = avg(codingResults.map((r) => r.score ?? 0));
    const interview = avg(voiceInterviews.map((v) => v.overallScore ?? 0));
    const aptitude = avg(aptitudeTests.map((a) => a.score ?? 0));
    const communication = avg(voiceInterviews.map((v) => v.communicationScore ?? 0));
    const projects = latestResume
      ? Math.min(100, ((latestResume.extractedData as { projects?: unknown[] })?.projects?.length ?? 0) * 20)
      : 0;

    const breakdown = {
      technicalSkills: Math.round(technicalSkills),
      communication: Math.round(communication || 50),
      resume: Math.round(resume),
      projects: Math.round(projects),
      coding: Math.round(coding),
      interview: Math.round(interview),
      aptitude: Math.round(aptitude),
    };

    const overall = Math.round(
      Object.values(breakdown).reduce((a, b) => a + b, 0) / Object.keys(breakdown).length
    );

    if (profile) {
      await prisma.profile.update({
        where: { userId: user.id },
        data: { readinessScore: overall },
      });
    }

    const roadmapCompletion = roadmaps.length
      ? avg(roadmaps.map((r) => r.completionPct))
      : 0;

    return apiSuccess({
      overall,
      breakdown,
      roadmapCompletion,
      progress: progress.slice(0, 20),
      xp: user.xp,
      level: user.level,
      streak: user.streak,
    });
  } catch {
    return apiError("Unauthorized", 401);
  }
}
