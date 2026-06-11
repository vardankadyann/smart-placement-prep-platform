"use client";

import { useEffect, useState } from "react";
import { Trophy, Flame, Star } from "lucide-react";
import { PageHeader, ScoreCard } from "@/components/dashboard/shared";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export default function GamificationPage() {
  const [data, setData] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    fetch("/api/gamification").then((r) => r.json()).then(setData);
  }, []);

  const badges = (data?.badges as { slug: string; name: string; description: string; icon: string; earned: boolean; xpReward: number }[]) ?? [];
  const leaderboard = (data?.leaderboard as { name: string; xp: number; level: number; streak: number }[]) ?? [];

  return (
    <>
      <PageHeader title="Achievements & Gamification" description="Earn XP, unlock badges, and compete on the leaderboard" />

      <div className="mb-8 grid gap-4 md:grid-cols-3">
        <ScoreCard title="Total XP" score={(data?.xp as number) ?? 0} subtitle={`Level ${(data?.level as number) ?? 1}`} />
        <Card className="glass-card p-6">
          <p className="text-sm text-muted-foreground flex items-center gap-1"><Flame className="h-4 w-4 text-orange-500" /> Streak</p>
          <p className="mt-2 text-4xl font-bold">{(data?.streak as number) ?? 0} days</p>
        </Card>
        <Card className="glass-card p-6">
          <p className="text-sm text-muted-foreground">Next Level</p>
          <Progress value={(((data?.xp as number) ?? 0) % 500) / 5} className="mt-4 h-2" />
          <p className="mt-2 text-xs text-muted-foreground">{500 - ((data?.xp as number) ?? 0) % 500} XP to go</p>
        </Card>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Star className="h-5 w-5 text-amber-500" /> Badges</CardTitle></CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2">
              {badges.map((b) => (
                <div key={b.slug} className={`rounded-lg border p-4 ${b.earned ? "border-primary/30 bg-primary/5" : "border-border/50 opacity-60"}`}>
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{b.name}</p>
                    {b.earned && <Badge variant="success">Earned</Badge>}
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{b.description}</p>
                  <p className="mt-2 text-xs text-primary">+{b.xpReward} XP</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Trophy className="h-5 w-5 text-amber-500" /> Leaderboard</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {leaderboard.map((u, i) => (
                <div key={i} className="flex items-center justify-between rounded-lg border border-border/50 p-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">{i + 1}</span>
                    <div>
                      <p className="font-medium">{u.name ?? "Student"}</p>
                      <p className="text-xs text-muted-foreground">Level {u.level}</p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold">{u.xp} XP</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
