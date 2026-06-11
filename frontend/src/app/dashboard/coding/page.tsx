"use client";

import { useState } from "react";
import { PageHeader, ScoreCard } from "@/components/dashboard/shared";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

const CATEGORIES = ["arrays", "strings", "linked-list", "stack", "queue", "trees", "graphs", "dp", "sql"];

export default function CodingPage() {
  const [test, setTest] = useState<{ id: string; title: string; description: string; starterCode: string; hints: string[] } | null>(null);
  const [code, setCode] = useState("");
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState("arrays");
  const [difficulty, setDifficulty] = useState("medium");

  const generate = async () => {
    setLoading(true);
    setResult(null);
    const res = await fetch("/api/coding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category, difficulty }),
    });
    const data = await res.json();
    if (data.test) {
      setTest(data.test);
      setCode(data.test.starterCode ?? "");
    }
    setLoading(false);
  };

  const submit = async () => {
    if (!test) return;
    setLoading(true);
    const res = await fetch("/api/coding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "submit", testId: test.id, code, language: "python" }),
    });
    const data = await res.json();
    setResult(data);
    setLoading(false);
  };

  return (
    <>
      <PageHeader title="Coding Round Preparation" description="DSA problems with Judge0 evaluation and complexity analysis" />

      <Card className="mb-6">
        <CardContent className="grid gap-4 py-6 md:grid-cols-3">
          <div>
            <Label>Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Difficulty</Label>
            <Select value={difficulty} onValueChange={setDifficulty}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end">
            <Button onClick={generate} disabled={loading} className="w-full">Generate Problem</Button>
          </div>
        </CardContent>
      </Card>

      {test && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>{test.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">{test.description}</p>
              {test.hints.length > 0 && (
                <div>
                  <p className="text-sm font-medium">Hints</p>
                  <ul className="list-inside list-disc text-sm text-muted-foreground">
                    {test.hints.map((h) => <li key={h}>{h}</li>)}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Your Solution</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <Textarea value={code} onChange={(e) => setCode(e.target.value)} className="min-h-[250px] font-mono text-sm" />
              <Button onClick={submit} disabled={loading}>{loading ? "Evaluating..." : "Submit Solution"}</Button>
            </CardContent>
          </Card>
        </div>
      )}

      {result?.result && (
        <div className="mt-6 space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <ScoreCard title="Score" score={((result.result as Record<string, unknown>).score as number) ?? 0} />
            <Card className="glass-card p-6">
              <p className="text-sm text-muted-foreground">Time Complexity</p>
              <p className="mt-2 text-lg font-semibold">{(result.aiEval as Record<string, unknown>)?.timeComplexity as string ?? "—"}</p>
            </Card>
            <Card className="glass-card p-6">
              <p className="text-sm text-muted-foreground">Space Complexity</p>
              <p className="mt-2 text-lg font-semibold">{(result.aiEval as Record<string, unknown>)?.spaceComplexity as string ?? "—"}</p>
            </Card>
          </div>
          <Card>
            <CardContent className="py-4">
              <Badge variant={(result.result as Record<string, unknown>).passed ? "success" : "danger"}>
                {(result.result as Record<string, unknown>).passed ? "Passed" : "Needs Work"}
              </Badge>
              <p className="mt-2 text-sm text-muted-foreground">{(result.aiEval as Record<string, unknown>)?.feedback as string}</p>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}
