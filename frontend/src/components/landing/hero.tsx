"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="relative overflow-hidden px-4 pb-24 pt-20 md:pt-32">
      <div className="absolute inset-0 bg-hero-glow" />
      <div className="relative mx-auto max-w-5xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm text-primary">
            <Sparkles className="h-4 w-4" />
            Powered by Gemini 2.5 Flash + Advanced RAG
          </span>
          <h1 className="mt-6 text-4xl font-bold tracking-tight md:text-6xl lg:text-7xl">
            Your AI{" "}
            <span className="gradient-text">Teaching Assistant</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl">
            Upload course PDFs, ask questions, get clear explanations with source
            citations — grounded only in your materials.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" className="gap-2 rounded-xl px-8" asChild>
              <Link href="/dashboard/chat">
                Start learning
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="glass" className="rounded-xl" asChild>
              <Link href="/dashboard/upload">Upload documents</Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
