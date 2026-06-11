import { NextRequest } from "next/server";
import { requireDbUser } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import { apiError, apiSuccess, parseBody } from "@/lib/api-helpers";
import prisma from "@/lib/prisma";
import { orchestrator } from "@/lib/ai/orchestrator";
import { awardXP, grantAchievement, updateStreak } from "@/lib/services/xp";
import { extractResumeText } from "@/lib/services/resume-parser";

export async function GET() {
  try {
    const user = await requireDbUser();
    const resumes = await prisma.resume.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });
    return apiSuccess({ resumes });
  } catch {
    return apiError("Unauthorized", 401);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireDbUser();
    const limited = rateLimit(`resume:${user.id}`);
    if (!limited.success) return apiError("Rate limit exceeded", 429);

    const body = await parseBody<{ fileUrl: string; fileName: string; fileType: string; text?: string }>(request);
    if (!body?.fileUrl || !body.fileName) return apiError("fileUrl and fileName required");

    let text = body.text ?? "";
    if (!text && body.fileUrl.startsWith("http")) {
      const res = await fetch(body.fileUrl);
      const buffer = Buffer.from(await res.arrayBuffer());
      text = await extractResumeText(buffer, body.fileType);
    }

    const analysis = await orchestrator.resume.analyze(text);

    const resume = await prisma.resume.create({
      data: {
        userId: user.id,
        fileName: body.fileName,
        fileUrl: body.fileUrl,
        fileType: body.fileType,
        rawText: text,
        extractedData: analysis as object,
        resumeScore: analysis.resumeScore,
        atsScore: analysis.atsScore,
        strengths: analysis.strengths,
        weaknesses: analysis.weaknesses,
        missingKeywords: analysis.missingKeywords,
        improvements: analysis.improvements,
        projectAnalysis: analysis.projectAnalysis as object,
        recruiterReview: analysis.recruiterReview as object,
      },
    });

    await prisma.progressTracking.create({
      data: { userId: user.id, category: "resume", metric: "score", value: analysis.resumeScore },
    });

    await awardXP(user.id, 50, "Resume analyzed");
    await updateStreak(user.id);
    if (analysis.resumeScore >= 85) await grantAchievement(user.id, "resume-pro");

    return apiSuccess({ resume, analysis });
  } catch (e) {
    return apiError(e instanceof Error ? e.message : "Analysis failed", 500);
  }
}
