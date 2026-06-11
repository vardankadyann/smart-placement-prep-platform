"use client";

import { useEffect, useState } from "react";
import { Target } from "lucide-react";
import { PageHeader, ScoreCard, TagList } from "@/components/dashboard/shared";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

export default function SkillGapPage() {
  const [jobs, setJobs] = useState<{ id: string; companyName: string; jobRole: string }[]>([]);
  const [resumes, setResumes] = useState<{ id: string; fileName: string }[]>([]);
  const [jobId, setJobId] = useState("");
  const [resumeId, setResumeId] = useState("");
  const [analysis, setAnalysis] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/job-description").then((r) => r.json()),
      fetch("/api/resume").then((r) => r.json()),
    ]).then(([j, r]) => {
      setJobs(j.jobs ?? []);
      setResumes(r.resumes ?? []);
    });
  }, []);

  const analyze = async () => {
    if (!jobId) return;
    setLoading(true);
    const res = await fetch("/api/skill-gap", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jobDescriptionId: jobId, resumeId: resumeId || undefined }),
    });
    const data = await res.json();
    setAnalysis(data.analysis ?? null);
    setLoading(false);
  };

  const priorities = (analysis?.learningPriorities as { skill: string; priority: string; reason: string }[]) ?? [];

  return (
    <>
      <PageHeader title="Skill Gap Analysis" description="Identify missing skills with prioritized learning recommendations" />

      <Card className="mb-8">
        <CardContent className="grid gap-4 py-6 md:grid-cols-3">
          <div>
            <Label>Job Description</Label>
            <Select value={jobId} onValueChange={setJobId}>
              <SelectTrigger className="mt-1"><SelectValue placeholder="Select JD" /></SelectTrigger>
              <SelectContent>
                {jobs.map((j) => <SelectItem key={j.id} value={j.id}>{j.companyName} — {j.jobRole}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Resume (optional)</Label>
            <Select value={resumeId} onValueChange={setResumeId}>
              <SelectTrigger className="mt-1"><SelectValue placeholder="Select resume" /></SelectTrigger>
              <SelectContent>
                {resumes.map((r) => <SelectItem key={r.id} value={r.id}>{r.fileName}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end">
            <Button onClick={analyze} disabled={loading || !jobId} className="w-full">{loading ? "Analyzing..." : "Analyze Gaps"}</Button>
          </div>
        </CardContent>
      </Card>

      {analysis && (
        <div className="space-y-6">
          <ScoreCard title="Gap Score" score={(analysis.gapScore as number) ?? 0} subtitle="Higher = better alignment" />
          <div className="grid gap-4 md:grid-cols-2">
            <Card><CardHeader><CardTitle>Missing Technical</CardTitle></CardHeader><CardContent><TagList items={(analysis.missingTechnical as string[]) ?? []} /></CardContent></Card>
            <Card><CardHeader><CardTitle>Missing Soft Skills</CardTitle></CardHeader><CardContent><TagList items={(analysis.missingSoft as string[]) ?? []} /></CardContent></Card>
          </div>
          <Card>
            <CardHeader><CardTitle>Learning Priorities</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {priorities.map((p) => (
                  <div key={p.skill} className="flex items-start gap-3 rounded-lg border border-border/50 p-3">
                    <Badge variant={p.priority === "critical" ? "danger" : p.priority === "high" ? "warning" : "secondary"}>{p.priority}</Badge>
                    <div>
                      <p className="font-medium">{p.skill}</p>
                      <p className="text-sm text-muted-foreground">{p.reason}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}
