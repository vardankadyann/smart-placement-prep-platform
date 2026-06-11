"use client";

import { useEffect, useState } from "react";
import { PageHeader, LoadingGrid } from "@/components/dashboard/shared";
import { ProgressLineChart, SkillBarChart } from "@/components/dashboard/charts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AnalyticsPage() {
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/analytics").then((r) => r.json()).then(setData).finally(() => setLoading(false));
  }, []);

  if (loading) return <><PageHeader title="Analytics Dashboard" /><LoadingGrid /></>;

  const skillDistribution = (data?.skillDistribution as { skill: string; value: number }[]) ?? [];
  const progressOverTime = (data?.progressOverTime as { date: string; score: number }[]) ?? [];
  const resumeTrends = (data?.resumeTrends as { date: string; resumeScore: number; atsScore: number }[]) ?? [];

  return (
    <>
      <PageHeader title="Analytics Dashboard" description="Track skill distribution, progress, and performance trends" />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Skill Distribution</CardTitle></CardHeader>
          <CardContent>
            {skillDistribution.length > 0 ? (
              <SkillBarChart data={skillDistribution} />
            ) : (
              <p className="py-12 text-center text-sm text-muted-foreground">Complete your profile to see skills</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Progress Over Time</CardTitle></CardHeader>
          <CardContent>
            {progressOverTime.length > 0 ? (
              <ProgressLineChart data={progressOverTime} />
            ) : (
              <p className="py-12 text-center text-sm text-muted-foreground">Activity will appear here as you use modules</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Resume Improvement Trends</CardTitle></CardHeader>
          <CardContent>
            {resumeTrends.length > 0 ? (
              <ProgressLineChart data={resumeTrends.map((r) => ({ date: r.date, score: r.resumeScore ?? 0 }))} />
            ) : (
              <p className="py-12 text-center text-sm text-muted-foreground">Upload resumes to track improvement</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Roadmap Completion</CardTitle></CardHeader>
          <CardContent>
            {((data?.roadmapCompletion as unknown[]) ?? []).length > 0 ? (
              <ul className="space-y-2">
                {((data?.roadmapCompletion as { title: string; completionPct: number; duration: number }[]) ?? []).map((r, i) => (
                  <li key={i} className="flex justify-between text-sm">
                    <span>{r.title}</span>
                    <span className="text-muted-foreground">{r.completionPct}% complete</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="py-12 text-center text-sm text-muted-foreground">Generate a roadmap to track completion</p>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
