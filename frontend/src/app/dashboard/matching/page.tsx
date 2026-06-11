"use client";

import { useEffect, useState } from "react";
import { GitCompare } from "lucide-react";
import { PageHeader, ScoreCard, TagList } from "@/components/dashboard/shared";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function MatchingPage() {
  const [resumes, setResumes] = useState<{ id: string; fileName: string }[]>([]);
  const [jobs, setJobs] = useState<{ id: string; companyName: string; jobRole: string }[]>([]);
  const [resumeId, setResumeId] = useState("");
  const [jobId, setJobId] = useState("");
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/resume").then((r) => r.json()),
      fetch("/api/job-description").then((r) => r.json()),
    ]).then(([r, j]) => {
      setResumes(r.resumes ?? []);
      setJobs(j.jobs ?? []);
    });
  }, []);

  const handleMatch = async () => {
    if (!resumeId || !jobId) return;
    setLoading(true);
    const res = await fetch("/api/matching", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resumeId, jobDescriptionId: jobId }),
    });
    const data = await res.json();
    setResult(data.analysis ?? null);
    setLoading(false);
  };

  return (
    <>
      <PageHeader title="Resume vs JD Matching" description="Compare your resume against job requirements" />

      <Card className="mb-8">
        <CardContent className="grid gap-4 py-6 md:grid-cols-3">
          <div>
            <Label>Resume</Label>
            <Select value={resumeId} onValueChange={setResumeId}>
              <SelectTrigger className="mt-1"><SelectValue placeholder="Select resume" /></SelectTrigger>
              <SelectContent>
                {resumes.map((r) => <SelectItem key={r.id} value={r.id}>{r.fileName}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Job Description</Label>
            <Select value={jobId} onValueChange={setJobId}>
              <SelectTrigger className="mt-1"><SelectValue placeholder="Select JD" /></SelectTrigger>
              <SelectContent>
                {jobs.map((j) => <SelectItem key={j.id} value={j.id}>{j.companyName} — {j.jobRole}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end">
            <Button onClick={handleMatch} disabled={loading || !resumeId || !jobId} className="w-full">
              {loading ? "Matching..." : "Compare"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {result && (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <ScoreCard title="Match Score" score={(result.matchScore as number) ?? 0} />
            <ScoreCard title="Selection Probability" score={(result.selectionProbability as number) ?? 0} subtitle="Estimated %" />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Card><CardHeader><CardTitle>Strong Matches</CardTitle></CardHeader><CardContent><TagList items={(result.strongMatches as string[]) ?? []} /></CardContent></Card>
            <Card><CardHeader><CardTitle>Partial Matches</CardTitle></CardHeader><CardContent><TagList items={(result.partialMatches as string[]) ?? []} /></CardContent></Card>
            <Card><CardHeader><CardTitle>Missing Skills</CardTitle></CardHeader><CardContent><TagList items={(result.missingSkills as string[]) ?? []} /></CardContent></Card>
            <Card><CardHeader><CardTitle>Improvement Suggestions</CardTitle></CardHeader><CardContent><TagList items={(result.improvementSuggestions as string[]) ?? []} /></CardContent></Card>
          </div>
        </div>
      )}
    </>
  );
}
