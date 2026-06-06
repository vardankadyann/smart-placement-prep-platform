"use client";

import { motion } from "framer-motion";
import { FileText } from "lucide-react";
import type { Source } from "@/lib/api";

export function SourceCard({ source, index }: { source: Source; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="glass-card p-3 text-sm"
    >
      <div className="mb-1 flex items-center gap-2 font-medium text-primary">
        <FileText className="h-4 w-4" />
        <span className="truncate">{source.filename}</span>
        <span className="ml-auto text-xs text-muted-foreground">
          {(source.score * 100).toFixed(0)}% match
        </span>
      </div>
      <p className="line-clamp-3 text-muted-foreground">{source.excerpt}</p>
    </motion.div>
  );
}
