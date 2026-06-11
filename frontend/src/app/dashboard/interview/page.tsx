"use client";

import { useState } from "react";
import { PageHeader } from "@/components/dashboard/shared";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Question {
  question: string;
  type: string;
  difficulty: string;
  sampleAnswer: string;
  evaluationCriteria: string[];
  followUps: string[];
}

export default function InterviewPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ type: "technical", difficulty: "medium", company: "", role: "" });

  const generate = async () => {
    setLoading(true);
    const res = await fetch("/api/interview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, count: 5 }),
    });
    const data = await res.json();
    setQuestions(data.questions ?? []);
    setLoading(false);
  };

  return (
    <>
      <PageHeader title="AI Interview Coach" description="Technical, HR, behavioral, and company-specific questions" />

      <Card className="mb-8">
        <CardContent className="grid gap-4 py-6 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <Label>Type</Label>
            <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="technical">Technical</SelectItem>
                <SelectItem value="hr">HR</SelectItem>
                <SelectItem value="behavioral">Behavioral</SelectItem>
                <SelectItem value="company">Company Specific</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Difficulty</Label>
            <Select value={form.difficulty} onValueChange={(v) => setForm({ ...form, difficulty: v })}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div><Label>Company</Label><Input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} className="mt-1" /></div>
          <div className="flex items-end"><Button onClick={generate} disabled={loading} className="w-full">{loading ? "Generating..." : "Generate Questions"}</Button></div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {questions.map((q, i) => (
          <Card key={i}>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Badge>{q.type}</Badge>
                <Badge variant="warning">{q.difficulty}</Badge>
              </div>
              <CardTitle className="text-base">{q.question}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div><p className="font-medium text-primary">Sample Answer</p><p className="text-muted-foreground">{q.sampleAnswer}</p></div>
              <div><p className="font-medium">Evaluation Criteria</p><ul className="list-inside list-disc text-muted-foreground">{q.evaluationCriteria.map((c) => <li key={c}>{c}</li>)}</ul></div>
              {q.followUps.length > 0 && <div><p className="font-medium">Follow-ups</p><ul className="list-inside list-disc text-muted-foreground">{q.followUps.map((f) => <li key={f}>{f}</li>)}</ul></div>}
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
