import { NextRequest } from "next/server";
import { requireDbUser } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import { mentorSchema } from "@/lib/validations";
import { apiError, apiSuccess, parseBody } from "@/lib/api-helpers";
import prisma from "@/lib/prisma";
import { generateText } from "@/lib/ai/client";
import { MENTOR_SYSTEM } from "@/lib/ai/agents/mentor-agent";
import { awardXP, updateStreak } from "@/lib/services/xp";
import { randomUUID } from "crypto";

export async function POST(request: NextRequest) {
  try {
    const user = await requireDbUser();
    const limited = rateLimit(`mentor:${user.id}`);
    if (!limited.success) return apiError("Rate limit exceeded", 429);

    const body = await parseBody<unknown>(request);
    const parsed = mentorSchema.safeParse(body);
    if (!parsed.success) return apiError("Message required");

    const sessionId = parsed.data.sessionId ?? randomUUID();

    await prisma.chatMessage.create({
      data: { userId: user.id, sessionId, role: "user", content: parsed.data.message },
    });

    const history = await prisma.chatMessage.findMany({
      where: { userId: user.id, sessionId },
      orderBy: { createdAt: "asc" },
      take: 20,
    });

    const profile = await prisma.profile.findUnique({ where: { userId: user.id } });
    const contextPrompt = profile
      ? `\nStudent context: ${profile.branch} student, skills: ${profile.skills.join(", ")}, targeting: ${profile.preferredRoles.join(", ")}`
      : "";

    const historyText = history
      .map((m) => `${m.role}: ${m.content}`)
      .join("\n");

    const reply = await generateText(
      MENTOR_SYSTEM + contextPrompt,
      historyText,
      "I'm your AI Career Mentor. Configure AI API keys for personalized guidance. Meanwhile, focus on: 1) Strengthen DSA daily, 2) Tailor resume per JD, 3) Practice mock interviews weekly."
    );

    await prisma.chatMessage.create({
      data: { userId: user.id, sessionId, role: "assistant", content: reply },
    });

    await awardXP(user.id, 10, "Career mentor chat");
    await updateStreak(user.id);

    return apiSuccess({ reply, sessionId });
  } catch (e) {
    return apiError(e instanceof Error ? e.message : "Chat failed", 500);
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await requireDbUser();
    const sessionId = request.nextUrl.searchParams.get("sessionId");
    if (!sessionId) return apiSuccess({ sessions: [] });

    const messages = await prisma.chatMessage.findMany({
      where: { userId: user.id, sessionId },
      orderBy: { createdAt: "asc" },
    });
    return apiSuccess({ messages, sessionId });
  } catch {
    return apiError("Unauthorized", 401);
  }
}
