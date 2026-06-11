import { NextRequest } from "next/server";
import { requireDbUser } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import { profileSchema } from "@/lib/validations";
import { apiError, apiSuccess, parseBody } from "@/lib/api-helpers";
import prisma from "@/lib/prisma";
import { awardXP, updateStreak } from "@/lib/services/xp";

export async function GET() {
  try {
    const user = await requireDbUser();
    const profile = await prisma.profile.findUnique({ where: { userId: user.id } });
    return apiSuccess({ profile, user: { name: user.name, email: user.email, xp: user.xp, level: user.level, streak: user.streak } });
  } catch {
    return apiError("Unauthorized", 401);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireDbUser();
    const limited = rateLimit(`profile:${user.id}`);
    if (!limited.success) return apiError("Rate limit exceeded", 429);

    const body = await parseBody<unknown>(request);
    const parsed = profileSchema.safeParse(body);
    if (!parsed.success) return apiError(parsed.error.errors[0]?.message ?? "Invalid input");

    const data = parsed.data;
    const skillProfile = {
      coreSkills: data.skills.slice(0, 5),
      skillCount: data.skills.length,
      strengthAreas: data.skills.filter((_, i) => i % 2 === 0),
    };
    const careerProfile = {
      targetRoles: data.preferredRoles,
      targetCompanies: data.preferredCompanies,
      academicStanding: data.cgpa ? (data.cgpa >= 8 ? "Strong" : data.cgpa >= 7 ? "Good" : "Average") : "Not specified",
    };
    const readinessScore = Math.min(
      100,
      30 +
        (data.skills.length * 3) +
        (data.cgpa ? data.cgpa * 5 : 20) +
        (data.preferredRoles.length * 2)
    );

    const profile = await prisma.profile.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        college: data.college,
        branch: data.branch,
        year: data.year,
        cgpa: data.cgpa,
        skills: data.skills,
        preferredRoles: data.preferredRoles,
        preferredCompanies: data.preferredCompanies,
        skillProfile,
        careerProfile,
        readinessScore,
      },
      update: {
        college: data.college,
        branch: data.branch,
        year: data.year,
        cgpa: data.cgpa,
        skills: data.skills,
        preferredRoles: data.preferredRoles,
        preferredCompanies: data.preferredCompanies,
        skillProfile,
        careerProfile,
        readinessScore,
      },
    });

    if (data.name) {
      await prisma.user.update({ where: { id: user.id }, data: { name: data.name } });
    }

    await awardXP(user.id, 25, "Profile created");
    await updateStreak(user.id);

    return apiSuccess({ profile, readinessScore });
  } catch (e) {
    return apiError(e instanceof Error ? e.message : "Failed", 500);
  }
}
