import { requireDbUser } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/api-helpers";
import prisma from "@/lib/prisma";
import { getLeaderboard, seedAchievements, ACHIEVEMENTS } from "@/lib/services/xp";

export async function GET() {
  try {
    await seedAchievements();
    const user = await requireDbUser();

    const [userAchievements, leaderboard] = await Promise.all([
      prisma.userAchievement.findMany({
        where: { userId: user.id },
        include: { achievement: true },
        orderBy: { earnedAt: "desc" },
      }),
      getLeaderboard(10),
    ]);

    const earnedSlugs = new Set(userAchievements.map((ua) => ua.achievement.slug));
    const allBadges = ACHIEVEMENTS.map((a) => ({
      ...a,
      earned: earnedSlugs.has(a.slug),
      earnedAt: userAchievements.find((ua) => ua.achievement.slug === a.slug)?.earnedAt,
    }));

    return apiSuccess({
      xp: user.xp,
      level: user.level,
      streak: user.streak,
      nextLevelXp: user.level * 500,
      badges: allBadges,
      earned: userAchievements,
      leaderboard,
    });
  } catch {
    return apiError("Unauthorized", 401);
  }
}
