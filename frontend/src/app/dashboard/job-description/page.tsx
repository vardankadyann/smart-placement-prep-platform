"use client";

import { useEffect, useState } from "react";
import { Briefcase } from "lucide-react";
import { PageHeader, TagList, EmptyState } from "@/components/dashboard/shared";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

interface Job {
  id: string;
  companyName: string;
  jobRole: string;
  requiredSkills: string[];
  hiddenSkills: string[];
  technicalSkills: string[];
  softSkills: string[];
  atsKeywords: string[];
  interviewFocus: string[];
  expectedDifficulty: string;
  hiringPriorities: string[];
}

export default function JobDescriptionPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [latest, setLatest] = useState<Job | null>(null);
  const [form, setForm] = useState({ companyName: "", jobRole: "", description: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/job-description").then((r) => r.json()).then((d) => {
      setJobs(d.jobs ?? []);
      setLatest(d.jobs?.[0] ?? null);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/job-description", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (data.job) { setLatest(data.job); setJobs((prev) => [data.job, ...prev]); }
    setLoading(false);
  };

  return (
    <>
      <PageHeader title="Job Description Analyzer" description="Decode requirements, hidden skills, and interview focus areas" />

      <div className="grid gap-8 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Paste Job Description</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div><Label>Company Name</Label><Input value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} className="mt-1" required /></div>
              <div><Label>Job Role</Label><Input value={form.jobRole} onChange={(e) => setForm({ ...form, jobRole: e.target.value })} className="mt-1" required /></div>
              <div><Label>Job Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="mt-1 min-h-[200px]" required /></div>
              <Button type="submit" disabled={loading}>{loading ? "Analyzing..." : "Analyze JD"}</Button>
            </form>
          </CardContent>
        </Card>

        {latest ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold">{latest.companyName}</h3>
              <Badge>{latest.jobRole}</Badge>
              <Badge variant="warning">{latest.expectedDifficulty}</Badge>
            </div>
            <Card><CardHeader><CardTitle>Required Skills</CardTitle></CardHeader><CardContent><TagList items={latest.requiredSkills} /></CardContent></Card>
            <Card><CardHeader><CardTitle>Hidden Skills</CardTitle></CardHeader><CardContent><TagList items={latest.hiddenSkills} /></CardContent></Card>
            <Card><CardHeader><CardTitle>Interview Focus</CardTitle></CardHeader><CardContent><TagList items={latest.interviewFocus} /></CardContent></Card>
            <Card><CardHeader><CardTitle>Hiring Priorities</CardTitle></CardHeader><CardContent><TagList items={latest.hiringPriorities} /></CardContent></Card>
          </div>
        ) : (
          <EmptyState icon={Briefcase} title="No JD analyzed" description="Paste a job description to get AI insights" />
        )}
      </div>
    </>
  );
}
