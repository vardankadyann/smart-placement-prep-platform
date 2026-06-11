import prisma from "../prisma";

const ACHIEVEMENTS = [
  { slug: "dsa-master", name: "DSA Master", description: "Complete 50 coding problems", icon: "Code", xpReward: 100, category: "coding" },
  { slug: "sql-expert", name: "SQL Expert", description: "Score 90%+ on SQL challenges", icon: "Database", xpReward: 75, category: "coding" },
  { slug: "interview-champion", name: "Interview Champion", description: "Complete 10 mock interviews", icon: "Mic", xpReward: 100, category: "interview" },
  { slug: "resume-pro", name: "Resume Pro", description: "Achieve 85+ resume score", icon: "FileText", xpReward: 50, category: "resume" },
  { slug: "placement-warrior", name: "Placement Warrior", description: "Reach 80+ readiness score", icon: "Trophy", xpReward: 150, category: "general" },
  { slug: "streak-7", name: "7-Day Streak", description: "Practice 7 days in a row", icon: "Flame", xpReward: 70, category: "streak" },
  { slug: "roadmap-complete", name: "Roadmap Finisher", description: "Complete a 90-day roadmap", icon: "Map", xpReward: 200, category: "learning" },
  { slug: "aptitude-ace", name: "Aptitude Ace", description: "Score 90%+ on aptitude test", icon: "Brain", xpReward: 60, category: "aptitude" },
];

export async function seedAchievements() {
  for (const a of ACHIEVEMENTS) {
    await prisma.achievement.upsert({
      where: { slug: a.slug },
      create: a,
      update: { name: a.name, description: a.description, xpReward: a.xpReward },
    });
  }
}

export async function awardXP(userId: string, amount: number, reason?: string) {
  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      xp: { increment: amount },
      level: { set: undefined },
      lastActiveAt: new Date(),
    },
  });

  const newLevel = Math.floor(user.xp / 500) + 1;
  if (newLevel !== user.level) {
    await prisma.user.update({ where: { id: userId }, data: { level: newLevel } });
  }

  if (reason) {
    await prisma.notification.create({
      data: { userId, title: `+${amount} XP`, message: reason, type: "xp" },
    });
  }

  return { xp: user.xp + amount, level: newLevel };
}

export async function updateStreak(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return;

  const lastActive = new Date(user.lastActiveAt);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24));

  let streak = user.streak;
  if (diffDays === 1) streak += 1;
  else if (diffDays > 1) streak = 1;

  await prisma.user.update({
    where: { id: userId },
    data: { streak, lastActiveAt: now },
  });

  if (streak === 7) await grantAchievement(userId, "streak-7");
}

export async function grantAchievement(userId: string, slug: string) {
  const achievement = await prisma.achievement.findUnique({ where: { slug } });
  if (!achievement) return;

  const existing = await prisma.userAchievement.findUnique({
    where: { userId_achievementId: { userId, achievementId: achievement.id } },
  });
  if (existing) return;

  await prisma.userAchievement.create({
    data: { userId, achievementId: achievement.id },
  });
  await awardXP(userId, achievement.xpReward, `Achievement unlocked: ${achievement.name}`);
}

export async function getLeaderboard(limit = 10) {
  return prisma.user.findMany({
    orderBy: { xp: "desc" },
    take: limit,
    select: { id: true, name: true, xp: true, level: true, streak: true },
  });
}

export { ACHIEVEMENTS };
