"use client";

import { useState } from "react";
import { Map } from "lucide-react";
import { PageHeader, TagList } from "@/components/dashboard/shared";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

interface RoadmapWeek {
  weekNumber: number;
  topics: string[];
  resources: { title: string; type: string }[];
  practiceQuestions: string[];
  miniProjects: string[];
  milestones: string[];
}

export default function RoadmapPage() {
  const [roadmap, setRoadmap] = useState<{ title: string; weeks: RoadmapWeek[]; expectedOutcomes: string[] } | null>(null);
  const [loading, setLoading] = useState(false);

  const generate = async (duration: 30 | 60 | 90) => {
    setLoading(true);
    const res = await fetch("/api/roadmap", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ duration: String(duration) }),
    });
    const data = await res.json();
    if (data.roadmap) {
      setRoadmap({
        title: data.roadmap.title,
        weeks: data.roadmap.weeks as RoadmapWeek[],
        expectedOutcomes: data.roadmap.expectedOutcomes,
      });
    }
    setLoading(false);
  };

  return (
    <>
      <PageHeader title="AI Learning Roadmap" description="Personalized 30/60/90-day preparation plans" />

      <Tabs defaultValue="30" className="mb-8">
        <TabsList>
          <TabsTrigger value="30" onClick={() => generate(30)}>30 Days</TabsTrigger>
          <TabsTrigger value="60" onClick={() => generate(60)}>60 Days</TabsTrigger>
          <TabsTrigger value="90" onClick={() => generate(90)}>90 Days</TabsTrigger>
        </TabsList>
        <TabsContent value="30">
          <Button onClick={() => generate(30)} disabled={loading}>{loading ? "Generating..." : "Generate 30-Day Roadmap"}</Button>
        </TabsContent>
        <TabsContent value="60">
          <Button onClick={() => generate(60)} disabled={loading}>{loading ? "Generating..." : "Generate 60-Day Roadmap"}</Button>
        </TabsContent>
        <TabsContent value="90">
          <Button onClick={() => generate(90)} disabled={loading}>{loading ? "Generating..." : "Generate 90-Day Roadmap"}</Button>
        </TabsContent>
      </Tabs>

      {roadmap ? (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">{roadmap.title}</h2>
          <Card>
            <CardHeader><CardTitle>Expected Outcomes</CardTitle></CardHeader>
            <CardContent><TagList items={roadmap.expectedOutcomes} /></CardContent>
          </Card>
          <div className="space-y-4">
            {roadmap.weeks.map((week) => (
              <Card key={week.weekNumber}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Map className="h-5 w-5 text-primary" /> Week {week.weekNumber}
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2">
                  <div><p className="mb-2 text-sm font-medium">Topics</p><TagList items={week.topics} /></div>
                  <div><p className="mb-2 text-sm font-medium">Practice</p><TagList items={week.practiceQuestions} /></div>
                  <div><p className="mb-2 text-sm font-medium">Mini Projects</p><TagList items={week.miniProjects} /></div>
                  <div><p className="mb-2 text-sm font-medium">Milestones</p><TagList items={week.milestones} /></div>
                  <div className="md:col-span-2">
                    <p className="mb-2 text-sm font-medium">Resources</p>
                    <div className="flex flex-wrap gap-2">
                      {week.resources.map((r) => (
                        <Badge key={r.title} variant="outline">{r.type}: {r.title}</Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        <Card className="py-16 text-center text-muted-foreground">
          Select a duration and generate your personalized roadmap
        </Card>
      )}
    </>
  );
}
