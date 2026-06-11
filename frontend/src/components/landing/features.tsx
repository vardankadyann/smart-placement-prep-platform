"use client";

import { motion } from "framer-motion";
import {
  FileText, Briefcase, Target, Map, MessageSquare, Mic, Code,
  Brain, Bot, BarChart3, Trophy, GitCompare, Star,
} from "lucide-react";

const features = [
  { icon: FileText, title: "Resume Analyzer", desc: "AI extracts skills, scores ATS compatibility, and gives recruiter perspective feedback." },
  { icon: Briefcase, title: "JD Analyzer", desc: "Decode job descriptions — hidden skills, interview focus, and hiring priorities." },
  { icon: GitCompare, title: "Resume vs JD Match", desc: "Compare your profile against roles with match scores and selection probability." },
  { icon: Target, title: "Skill Gap Analysis", desc: "Identify missing skills with prioritized learning recommendations." },
  { icon: Map, title: "AI Learning Roadmap", desc: "Personalized 30/60/90-day plans with resources, projects, and milestones." },
  { icon: MessageSquare, title: "Interview Coach", desc: "Technical, HR, and behavioral questions with sample answers and criteria." },
  { icon: Mic, title: "Voice Mock Interview", desc: "Speak your answers — get communication, confidence, and clarity scores." },
  { icon: Code, title: "Coding Round Prep", desc: "DSA problems across all topics with Judge0 evaluation and complexity analysis." },
  { icon: Brain, title: "Aptitude Prep", desc: "Quantitative, logical, and verbal aptitude with company-specific questions." },
  { icon: Star, title: "Behavioral Analysis", desc: "STAR framework evaluation with actionable improvement suggestions." },
  { icon: Bot, title: "Career Mentor Chat", desc: "24/7 AI mentor for career guidance with conversation memory." },
  { icon: BarChart3, title: "Analytics Dashboard", desc: "Track progress, skill distribution, and performance trends over time." },
];

export function Features() {
  return (
    <section id="features" className="px-4 py-20">
      <div className="mx-auto max-w-6xl">
        <div className="text-center">
          <h2 className="text-3xl font-bold md:text-4xl">Everything You Need to <span className="gradient-text">Get Placed</span></h2>
          <p className="mt-4 text-muted-foreground">15 integrated modules powered by specialized AI agents</p>
        </div>
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="glass-card p-6 transition-transform hover:-translate-y-1"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <f.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function GamificationFeature() {
  return (
    <section className="px-4 py-12">
      <div className="mx-auto max-w-6xl">
        <div className="glass-card flex flex-col items-center gap-4 p-8 text-center md:flex-row md:text-left">
          <Trophy className="h-12 w-12 text-amber-500" />
          <div>
            <h3 className="text-xl font-semibold">Gamified Learning Experience</h3>
            <p className="mt-2 text-muted-foreground">
              Earn XP, unlock badges like DSA Master and Interview Champion, compete on leaderboards, and maintain daily streaks.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
