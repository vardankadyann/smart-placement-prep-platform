"use client";

import { useState } from "react";
import { PageHeader, ScoreCard, TagList } from "@/components/dashboard/shared";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";

const QUESTIONS = [
  "Tell me about a time you failed and what you learned from it.",
  "Describe a situation where you had to meet a tight deadline.",
  "Give an example of when you showed leadership without formal authority.",
];

export default function BehavioralPage() {
  const [question, setQuestion] = useState(QUESTIONS[0]);
  const [answer, setAnswer] = useState("");
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);

  const evaluate = async () => {
    setLoading(true);
    const res = await fetch("/api/behavioral", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question, answer }),
    });
    const data = await res.json();
    setResult(data.evaluation ?? null);
    setLoading(false);
  };

  const star = result?.starScores as Record<string, number> | undefined;

  return (
    <>
      <PageHeader title="Behavioral Interview Analysis" description="STAR framework evaluation with actionable feedback" />

      <Card className="mb-6">
        <CardContent className="space-y-4 py-6">
          <div className="flex flex-wrap gap-2">
            {QUESTIONS.map((q) => (
              <Button key={q} variant="outline" size="sm" onClick={() => { setQuestion(q); setAnswer(""); setResult(null); }}>
                {q.slice(0, 35)}...
              </Button>
            ))}
          </div>
          <p className="rounded-lg bg-muted/50 p-4 text-sm font-medium">{question}</p>
          <Label>Your Answer (use STAR format)</Label>
          <Textarea value={answer} onChange={(e) => setAnswer(e.target.value)} className="min-h-[150px]" placeholder="Situation → Task → Action → Result" />
          <Button onClick={evaluate} disabled={loading || answer.length < 20}>{loading ? "Evaluating..." : "Evaluate with STAR"}</Button>
        </CardContent>
      </Card>

      {result && (
        <div className="space-y-6">
          <ScoreCard title="Overall STAR Score" score={(result.overallScore as number) ?? 0} />
          {star && (
            <Card>
              <CardHeader><CardTitle>STAR Breakdown</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(star).map(([key, val]) => (
                  <div key={key}>
                    <div className="mb-1 flex justify-between text-sm"><span className="capitalize">{key}</span><span>{val}/100</span></div>
                    <Progress value={val} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
          <div className="grid gap-4 md:grid-cols-2">
            <Card><CardHeader><CardTitle>Strengths</CardTitle></CardHeader><CardContent><TagList items={(result.strengths as string[]) ?? []} /></CardContent></Card>
            <Card><CardHeader><CardTitle>Improvements</CardTitle></CardHeader><CardContent><TagList items={(result.suggestions as string[]) ?? []} /></CardContent></Card>
          </div>
        </div>
      )}
    </>
  );
}
