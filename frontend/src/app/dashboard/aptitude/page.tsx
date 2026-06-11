"use client";

import { useState } from "react";
import { PageHeader, ScoreCard } from "@/components/dashboard/shared";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

interface AptitudeQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export default function AptitudePage() {
  const [testId, setTestId] = useState("");
  const [questions, setQuestions] = useState<AptitudeQuestion[]>([]);
  const [answers, setAnswers] = useState<number[]>([]);
  const [result, setResult] = useState<{ score: number; correct: number; total: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState("quantitative");
  const [company, setCompany] = useState("");

  const startTest = async () => {
    setLoading(true);
    setResult(null);
    const res = await fetch("/api/aptitude", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category, company: company || undefined, count: 10 }),
    });
    const data = await res.json();
    if (data.test) {
      setTestId(data.test.id);
      setQuestions(data.questions ?? []);
      setAnswers(new Array((data.questions ?? []).length).fill(-1));
    }
    setLoading(false);
  };

  const submit = async () => {
    setLoading(true);
    const res = await fetch("/api/aptitude", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "submit", testId, answers }),
    });
    const data = await res.json();
    setResult(data);
    setLoading(false);
  };

  return (
    <>
      <PageHeader title="Aptitude Preparation" description="Quantitative, logical reasoning, and verbal ability" />

      {!questions.length ? (
        <Card>
          <CardContent className="grid gap-4 py-6 md:grid-cols-3">
            <div>
              <Label>Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="quantitative">Quantitative</SelectItem>
                  <SelectItem value="logical">Logical Reasoning</SelectItem>
                  <SelectItem value="verbal">Verbal Ability</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>Company (optional)</Label><Input value={company} onChange={(e) => setCompany(e.target.value)} className="mt-1" placeholder="e.g. TCS, Infosys" /></div>
            <div className="flex items-end"><Button onClick={startTest} disabled={loading} className="w-full">Start Test</Button></div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {questions.map((q, i) => (
            <Card key={i}>
              <CardHeader><CardTitle className="text-base">Q{i + 1}. {q.question}</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {q.options.map((opt, j) => (
                  <label key={j} className="flex cursor-pointer items-center gap-3 rounded-lg border border-border/50 p-3 hover:bg-accent/50">
                    <input type="radio" name={`q-${i}`} checked={answers[i] === j} onChange={() => {
                      const next = [...answers]; next[i] = j; setAnswers(next);
                    }} />
                    {opt}
                  </label>
                ))}
              </CardContent>
            </Card>
          ))}
          <Button onClick={submit} disabled={loading || answers.includes(-1)} size="lg">Submit Test</Button>
        </div>
      )}

      {result && (
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <ScoreCard title="Score" score={result.score} />
          <Card className="glass-card p-6"><p className="text-sm text-muted-foreground">Correct</p><p className="text-2xl font-bold">{result.correct}/{result.total}</p></Card>
        </div>
      )}
    </>
  );
}
