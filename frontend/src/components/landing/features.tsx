"use client";

import { motion } from "framer-motion";
import {
  BookOpen,
  Brain,
  FileSearch,
  MessageSquare,
  Shield,
  Zap,
} from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "Teaching mode",
    description:
      "Simple explanations, analogies, step-by-step breakdowns, summaries, and quizzes — tailored for learning.",
  },
  {
    icon: FileSearch,
    title: "Advanced RAG",
    description:
      "Hybrid search, query rewriting, re-ranking, and context compression for accurate answers.",
  },
  {
    icon: MessageSquare,
    title: "ChatGPT-quality chat",
    description:
      "Streaming responses, markdown, code blocks, citations, and conversation memory.",
  },
  {
    icon: BookOpen,
    title: "Knowledge base",
    description:
      "Manage uploaded PDFs, view chunk counts, embedding status, and search your library.",
  },
  {
    icon: Shield,
    title: "Grounded answers",
    description:
      "Answers only from your documents. No hallucinations — clear fallback when info isn't found.",
  },
  {
    icon: Zap,
    title: "Fast & modern",
    description:
      "Glassmorphism UI, dark mode, animations, and mobile-responsive dashboard.",
  },
];

export function Features() {
  return (
    <section className="px-4 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mb-16 text-center">
          <h2 className="text-3xl font-bold md:text-4xl">Everything you need to learn smarter</h2>
          <p className="mt-4 text-muted-foreground">
            Production-grade RAG pipeline built for education
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="glass-card p-6"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <f.icon className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
