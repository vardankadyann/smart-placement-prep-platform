"use client";

import { motion } from "framer-motion";
import { User, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { MarkdownMessage } from "./markdown-message";
import type { Source } from "@/lib/api";
import { SourceCard } from "./source-card";

interface MessageBubbleProps {
  role: "user" | "assistant";
  content: string;
  sources?: Source[];
  isStreaming?: boolean;
}

export function MessageBubble({
  role,
  content,
  sources,
  isStreaming,
}: MessageBubbleProps) {
  const isUser = role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn("flex gap-3 px-4 py-3", isUser ? "flex-row-reverse" : "flex-row")}
    >
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl",
          isUser ? "bg-primary text-primary-foreground" : "bg-accent text-accent-foreground"
        )}
      >
        {isUser ? <User className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
      </div>
      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-4 py-3 shadow-sm md:max-w-[75%]",
          isUser
            ? "bg-primary text-primary-foreground"
            : "glass border border-border/50"
        )}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap text-sm leading-relaxed">{content}</p>
        ) : (
          <div className="text-sm">
            <MarkdownMessage content={content} />
            {isStreaming && (
              <span className="ml-0.5 inline-block h-4 w-0.5 animate-pulse bg-primary" />
            )}
          </div>
        )}
        {!isUser && sources && sources.length > 0 && (
          <div className="mt-4 space-y-2 border-t border-border/50 pt-3">
            <p className="text-xs font-medium text-muted-foreground">Sources</p>
            {sources.map((s, i) => (
              <SourceCard key={s.id} source={s} index={i} />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
