"use client";

import { motion } from "framer-motion";

const steps = [
  { step: "01", title: "Upload PDFs", desc: "Drag and drop your course materials" },
  { step: "02", title: "Index & embed", desc: "Text extraction, chunking, Gemini embeddings" },
  { step: "03", title: "Ask anything", desc: "Hybrid search retrieves the best context" },
  { step: "04", title: "Learn with citations", desc: "Teaching-mode answers with source cards" },
];

export function HowItWorks() {
  return (
    <section className="border-y border-border/50 bg-muted/30 px-4 py-24">
      <div className="mx-auto max-w-6xl">
        <h2 className="mb-16 text-center text-3xl font-bold md:text-4xl">How it works</h2>
        <div className="grid gap-8 md:grid-cols-4">
          {steps.map((s, i) => (
            <motion.div
              key={s.step}
              initial={{ opacity: 0, x: -12 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="relative text-center"
            >
              <span className="text-4xl font-bold text-primary/30">{s.step}</span>
              <h3 className="mt-2 text-lg font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
