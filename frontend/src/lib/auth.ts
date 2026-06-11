import { auth, currentUser } from "@clerk/nextjs/server";
import prisma from "./prisma";

export async function getAuthUserId(): Promise<string | null> {
  const { userId } = await auth();
  return userId;
}

export async function requireAuthUserId(): Promise<string> {
  const userId = await getAuthUserId();
  if (!userId) throw new Error("Unauthorized");
  return userId;
}

export async function getOrCreateDbUser() {
  const clerkUser = await currentUser();
  if (!clerkUser) return null;

  const email = clerkUser.emailAddresses[0]?.emailAddress;
  if (!email) return null;

  const user = await prisma.user.upsert({
    where: { clerkId: clerkUser.id },
    create: {
      clerkId: clerkUser.id,
      email,
      name: clerkUser.fullName ?? clerkUser.firstName ?? "Student",
    },
    update: {
      email,
      name: clerkUser.fullName ?? clerkUser.firstName ?? undefined,
      lastActiveAt: new Date(),
    },
    include: { profile: true },
  });

  return user;
}

export async function requireDbUser() {
  const user = await getOrCreateDbUser();
  if (!user) throw new Error("Unauthorized");
  return user;
}
