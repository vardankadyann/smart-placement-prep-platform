"use client";

import { useEffect, useState } from "react";
import { Upload, FileText } from "lucide-react";
import { PageHeader, ScoreCard, TagList, EmptyState } from "@/components/dashboard/shared";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useUploadThing } from "@/lib/uploadthing";

interface Resume {
  id: string;
  fileName: string;
  resumeScore: number;
  atsScore: number;
  strengths: string[];
  weaknesses: string[];
  missingKeywords: string[];
  improvements: string[];
}

export default function ResumePage() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [latest, setLatest] = useState<Resume | null>(null);
  const [loading, setLoading] = useState(false);
  const { startUpload, isUploading } = useUploadThing("resumeUploader");

  const load = () => fetch("/api/resume").then((r) => r.json()).then((d) => {
    setResumes(d.resumes ?? []);
    setLatest(d.resumes?.[0] ?? null);
  });

  useEffect(() => { load(); }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    const uploaded = await startUpload([file]);
    if (uploaded?.[0]) {
      await fetch("/api/resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileUrl: uploaded[0].url,
          fileName: uploaded[0].name,
          fileType: uploaded[0].type ?? file.type,
        }),
      });
      await load();
    }
    setLoading(false);
  };

  return (
    <>
      <PageHeader title="Resume Analyzer" description="Upload PDF or DOCX — get ATS score, strengths, and recruiter feedback" />

      <Card className="mb-8">
        <CardContent className="flex flex-col items-center gap-4 py-10">
          <Upload className="h-10 w-10 text-primary" />
          <p className="text-sm text-muted-foreground">Supported: PDF, DOCX (max 8MB)</p>
          <label>
            <input type="file" accept=".pdf,.docx" className="hidden" onChange={handleUpload} disabled={loading || isUploading} />
            <Button asChild disabled={loading || isUploading}>
              <span>{loading || isUploading ? "Analyzing..." : "Upload Resume"}</span>
            </Button>
          </label>
        </CardContent>
      </Card>

      {latest ? (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <ScoreCard title="Resume Score" score={latest.resumeScore ?? 0} />
            <ScoreCard title="ATS Score" score={latest.atsScore ?? 0} />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Card><CardHeader><CardTitle>Strengths</CardTitle></CardHeader><CardContent><TagList items={latest.strengths} /></CardContent></Card>
            <Card><CardHeader><CardTitle>Weaknesses</CardTitle></CardHeader><CardContent><TagList items={latest.weaknesses} /></CardContent></Card>
            <Card><CardHeader><CardTitle>Missing Keywords</CardTitle></CardHeader><CardContent><TagList items={latest.missingKeywords} /></CardContent></Card>
            <Card><CardHeader><CardTitle>Suggested Improvements</CardTitle></CardHeader><CardContent><TagList items={latest.improvements} /></CardContent></Card>
          </div>
        </div>
      ) : (
        <EmptyState icon={FileText} title="No resume analyzed yet" description="Upload your resume to get AI-powered feedback" />
      )}

      {resumes.length > 1 && (
        <Card className="mt-8">
          <CardHeader><CardTitle>Previous Analyses</CardTitle></CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {resumes.map((r) => (
                <li key={r.id} className="flex justify-between text-sm">
                  <span>{r.fileName}</span>
                  <span className="text-muted-foreground">Score: {r.resumeScore}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </>
  );
}
