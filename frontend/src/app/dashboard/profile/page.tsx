"use client";

import { useEffect, useState } from "react";
import { PageHeader, ScoreCard, TagList } from "@/components/dashboard/shared";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function ProfilePage() {
  const [form, setForm] = useState({
    name: "", college: "", branch: "", year: "", cgpa: "",
    skills: "", preferredRoles: "", preferredCompanies: "",
  });
  const [profile, setProfile] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/profile").then((r) => r.json()).then((d) => {
      if (d.profile) {
        setProfile(d.profile);
        setForm({
          name: d.user?.name ?? "",
          college: d.profile.college ?? "",
          branch: d.profile.branch ?? "",
          year: d.profile.year ?? "",
          cgpa: d.profile.cgpa?.toString() ?? "",
          skills: (d.profile.skills ?? []).join(", "),
          preferredRoles: (d.profile.preferredRoles ?? []).join(", "),
          preferredCompanies: (d.profile.preferredCompanies ?? []).join(", "),
        });
      }
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSaved(false);
    const res = await fetch("/api/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        college: form.college,
        branch: form.branch,
        year: form.year,
        cgpa: form.cgpa ? parseFloat(form.cgpa) : undefined,
        skills: form.skills.split(",").map((s) => s.trim()).filter(Boolean),
        preferredRoles: form.preferredRoles.split(",").map((s) => s.trim()).filter(Boolean),
        preferredCompanies: form.preferredCompanies.split(",").map((s) => s.trim()).filter(Boolean),
      }),
    });
    const data = await res.json();
    if (data.profile) { setProfile(data.profile); setSaved(true); }
    setLoading(false);
  };

  const split = (s: string) => s.split(",").map((x) => x.trim()).filter(Boolean);

  return (
    <>
      <PageHeader title="Student Profile" description="Build your skill profile and get your initial readiness score" />

      <div className="grid gap-8 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Profile Details</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {[
                { key: "name", label: "Name" },
                { key: "college", label: "College" },
                { key: "branch", label: "Branch" },
                { key: "year", label: "Year" },
                { key: "cgpa", label: "CGPA" },
              ].map(({ key, label }) => (
                <div key={key}>
                  <Label>{label}</Label>
                  <Input
                    value={form[key as keyof typeof form]}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    className="mt-1"
                  />
                </div>
              ))}
              <div>
                <Label>Skills (comma-separated)</Label>
                <Textarea value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} className="mt-1" />
              </div>
              <div>
                <Label>Preferred Job Roles</Label>
                <Input value={form.preferredRoles} onChange={(e) => setForm({ ...form, preferredRoles: e.target.value })} className="mt-1" />
              </div>
              <div>
                <Label>Preferred Companies</Label>
                <Input value={form.preferredCompanies} onChange={(e) => setForm({ ...form, preferredCompanies: e.target.value })} className="mt-1" />
              </div>
              <Button type="submit" disabled={loading}>{loading ? "Saving..." : "Save Profile"}</Button>
              {saved && <p className="text-sm text-emerald-500">Profile saved! +25 XP earned.</p>}
            </form>
          </CardContent>
        </Card>

        {profile && (
          <div className="space-y-4">
            <ScoreCard title="Readiness Score" score={(profile.readinessScore as number) ?? 0} subtitle="Based on your profile" />
            <Card>
              <CardHeader><CardTitle>Your Skills</CardTitle></CardHeader>
              <CardContent><TagList items={split(form.skills)} /></CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Target Roles</CardTitle></CardHeader>
              <CardContent><TagList items={split(form.preferredRoles)} /></CardContent>
            </Card>
          </div>
        )}
      </div>
    </>
  );
}
