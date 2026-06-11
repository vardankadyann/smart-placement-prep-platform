"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { SignInButton, SignUpButton, SignedIn, SignedOut } from "@clerk/nextjs";

export function Navbar() {
  return (
    <header className="fixed top-0 z-50 w-full border-b border-border/50 glass">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <Sparkles className="h-5 w-5 text-primary" />
          <span>AI Placement Copilot</span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm md:flex">
          <Link href="#features" className="text-muted-foreground hover:text-foreground">Features</Link>
          <Link href="#how-it-works" className="text-muted-foreground hover:text-foreground">How It Works</Link>
          <Link href="#pricing" className="text-muted-foreground hover:text-foreground">Pricing</Link>
          <Link href="#faq" className="text-muted-foreground hover:text-foreground">FAQ</Link>
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <SignedOut>
            <SignInButton mode="modal">
              <Button variant="ghost" size="sm">Sign In</Button>
            </SignInButton>
            <SignUpButton mode="modal">
              <Button size="sm">Get Started</Button>
            </SignUpButton>
          </SignedOut>
          <SignedIn>
            <Button size="sm" asChild>
              <Link href="/dashboard">Dashboard</Link>
            </Button>
          </SignedIn>
        </div>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-border/50 px-4 py-12">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 md:flex-row">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">AI Placement Copilot</span>
        </div>
        <p className="text-xs text-muted-foreground">
          Your Personal AI Career Mentor for Placements, Internships, and Job Preparation
        </p>
        <p className="text-xs text-muted-foreground">&copy; {new Date().getFullYear()} AI Placement Copilot</p>
      </div>
    </footer>
  );
}
