"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Flame, Trophy, TrendingUp } from "lucide-react";
import { PageHeader, ScoreCard, LoadingGrid } from "@/components/dashboard/shared";
import { ReadinessRadar, ProgressLineChart } from "@/components/dashboard/charts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ReadinessData {
  overall: number;
  breakdown: Record<string, number>;
  roadmapCompletion: number;
  xp: number;
  level: number;
  streak: number;
  progress: { category: string; metric: string; value: number; recordedAt: string }[];
}

export default function DashboardPage() {
  const [data, setData] = useState<ReadinessData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard/readiness")
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <><PageHeader title="Readiness Dashboard" description="Your placement preparation overview" /><LoadingGrid count={4} /></>;

  const breakdown = data?.breakdown ?? {};
  const radarData = Object.entries(breakdown).map(([key, score]) => ({
    subject: key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase()),
    score,
  }));

  const progressChart = (data?.progress ?? []).slice(0, 10).map((p) => ({
    date: new Date(p.recordedAt).toLocaleDateString(),
    score: p.value,
  }));

  return (
    <>
      <PageHeader
        title="Readiness Dashboard"
        description="Track your overall placement readiness across all modules"
      />

      <div className="mb-6 flex flex-wrap gap-3">
        <Badge variant="secondary" className="gap-1 px-3 py-1">
          <Trophy className="h-3 w-3" /> Level {data?.level ?? 1}
        </Badge>
        <Badge variant="secondary" className="gap-1 px-3 py-1">
          {data?.xp ?? 0} XP
        </Badge>
        <Badge variant="secondary" className="gap-1 px-3 py-1">
          <Flame className="h-3 w-3" /> {data?.streak ?? 0} day streak
        </Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <ScoreCard title="Overall Readiness" score={data?.overall ?? 0} subtitle="Combined score across all areas" />
        <ScoreCard title="Resume" score={breakdown.resume ?? 0} />
        <ScoreCard title="Coding" score={breakdown.coding ?? 0} />
        <ScoreCard title="Interview" score={breakdown.interview ?? 0} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" /> Skills Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ReadinessRadar data={radarData} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Progress Over Time</CardTitle></CardHeader>
          <CardContent>
            {progressChart.length > 0 ? (
              <ProgressLineChart data={progressChart} />
            ) : (
              <p className="py-12 text-center text-sm text-muted-foreground">
                Complete modules to see progress trends
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { href: "/dashboard/resume", label: "Analyze Resume" },
          { href: "/dashboard/interview", label: "Mock Interview" },
          { href: "/dashboard/coding", label: "Coding Practice" },
          { href: "/dashboard/roadmap", label: "Get Roadmap" },
        ].map((action) => (
          <Button key={action.href} variant="outline" asChild className="h-auto py-4">
            <Link href={action.href}>{action.label}</Link>
          </Button>
        ))}
      </div>
    </>
  );
}
