"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import {
  LayoutDashboard, User, FileText, Briefcase, GitCompare, Target,
  Map, MessageSquare, Mic, Code, Brain, Star, Bot, Trophy, BarChart3,
  X, Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/dashboard", label: "Readiness", icon: LayoutDashboard },
  { href: "/dashboard/profile", label: "Profile", icon: User },
  { href: "/dashboard/resume", label: "Resume", icon: FileText },
  { href: "/dashboard/job-description", label: "Job Description", icon: Briefcase },
  { href: "/dashboard/matching", label: "Resume vs JD", icon: GitCompare },
  { href: "/dashboard/skill-gap", label: "Skill Gap", icon: Target },
  { href: "/dashboard/roadmap", label: "Roadmap", icon: Map },
  { href: "/dashboard/interview", label: "Interview Coach", icon: MessageSquare },
  { href: "/dashboard/voice-interview", label: "Voice Mock", icon: Mic },
  { href: "/dashboard/coding", label: "Coding Prep", icon: Code },
  { href: "/dashboard/aptitude", label: "Aptitude", icon: Brain },
  { href: "/dashboard/behavioral", label: "Behavioral", icon: Star },
  { href: "/dashboard/mentor", label: "Career Mentor", icon: Bot },
  { href: "/dashboard/gamification", label: "Achievements", icon: Trophy },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
];

export function DashboardSidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={onClose} />
      )}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border/50 glass transition-transform lg:static lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-14 items-center justify-between border-b border-border/50 px-4">
          <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
            <Sparkles className="h-5 w-5 text-primary" />
            <span className="gradient-text text-sm">Placement Copilot</span>
          </Link>
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <nav className="flex-1 overflow-y-auto p-3">
          <ul className="space-y-0.5">
            {navItems.map(({ href, label, icon: Icon }) => {
              const active = pathname === href;
              return (
                <li key={href}>
                  <Link
                    href={href}
                    onClick={onClose}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                      active
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="border-t border-border/50 p-4">
          <div className="flex items-center gap-3">
            <UserButton afterSignOutUrl="/" />
            <span className="text-xs text-muted-foreground">Account</span>
          </div>
        </div>
      </aside>
    </>
  );
}
