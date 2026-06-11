"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SignUpButton, SignedIn, SignedOut } from "@clerk/nextjs";

export function Hero() {
  return (
    <section className="relative overflow-hidden px-4 pb-20 pt-28 md:pt-36">
      <div className="absolute inset-0 bg-hero-glow" />
      <div className="relative mx-auto max-w-6xl text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm text-primary">
            <Sparkles className="h-4 w-4" />
            AI-Powered Career Preparation
          </div>
          <h1 className="text-4xl font-bold tracking-tight md:text-6xl lg:text-7xl">
            Your Personal{" "}
            <span className="gradient-text">AI Career Mentor</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl">
            Complete ecosystem for placements, internships, and job preparation.
            Analyze resumes, match job descriptions, practice interviews, and track your readiness — all in one platform.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <SignedOut>
              <SignUpButton mode="modal">
                <Button size="lg" className="gap-2">
                  Start Free <ArrowRight className="h-4 w-4" />
                </Button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <Button size="lg" asChild>
                <Link href="/dashboard">Go to Dashboard <ArrowRight className="h-4 w-4" /></Link>
              </Button>
            </SignedIn>
            <Button size="lg" variant="outline" asChild>
              <Link href="#features">Explore Features</Link>
            </Button>
          </div>
          <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
            {["Resume & ATS Analysis", "Mock Interviews", "Coding Prep", "Skill Roadmaps"].map((item) => (
              <span key={item} className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" /> {item}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
