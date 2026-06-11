"use client";

import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

interface ScoreCardProps {
  title: string;
  score: number;
  subtitle?: string;
  className?: string;
}

export function ScoreCard({ title, score, subtitle, className }: ScoreCardProps) {
  const color = score >= 80 ? "text-emerald-500" : score >= 60 ? "text-amber-500" : "text-red-500";

  return (
    <div className={cn("glass-card p-6", className)}>
      <p className="text-sm text-muted-foreground">{title}</p>
      <p className={cn("mt-2 text-4xl font-bold", color)}>{score}</p>
      {subtitle && <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>}
      <Progress value={score} className="mt-4 h-2" />
    </div>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 py-16 text-center">
      <Icon className="mb-4 h-12 w-12 text-muted-foreground/50" />
      <h3 className="text-lg font-medium">{title}</h3>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

export function PageHeader({ title, description }: { title: string; description?: string }) {
  return (
    <div className="mb-8">
      <h1 className="text-2xl font-bold tracking-tight md:text-3xl">{title}</h1>
      {description && <p className="mt-2 text-muted-foreground">{description}</p>}
    </div>
  );
}

export function LoadingGrid({ count = 3 }: { count?: number }) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="glass-card h-32 animate-pulse bg-muted/30" />
      ))}
    </div>
  );
}

export function TagList({ items, variant = "secondary" }: { items: string[]; variant?: "default" | "secondary" | "outline" | "success" | "warning" | "danger" }) {
  if (!items.length) return <p className="text-sm text-muted-foreground">None identified</p>;
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <span key={item} className="rounded-full bg-secondary px-3 py-1 text-xs font-medium">
          {item}
        </span>
      ))}
    </div>
  );
}
