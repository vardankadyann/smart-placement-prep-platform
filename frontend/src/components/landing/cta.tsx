"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export function CTA() {
  return (
    <section className="px-4 py-24">
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        className="mx-auto max-w-4xl rounded-3xl bg-gradient-to-br from-violet-600/90 via-purple-600/90 to-indigo-600/90 p-12 text-center text-white shadow-2xl"
      >
        <h2 className="text-3xl font-bold md:text-4xl">
          Ready to transform how you study?
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-white/80">
          Upload your materials and start learning with an AI tutor that only uses your content.
        </p>
        <Button
          size="lg"
          variant="secondary"
          className="mt-8 rounded-xl bg-white text-purple-700 hover:bg-white/90"
          asChild
        >
          <Link href="/dashboard/chat">Get started free</Link>
        </Button>
      </motion.div>
    </section>
  );
}
