"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BarChart3, FileText, MessageSquare, Layers } from "lucide-react";
import { api, type Analytics } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";

const statCards = [
  { key: "total_documents" as const, label: "Documents", icon: FileText },
  { key: "total_chunks" as const, label: "Chunks", icon: Layers },
  { key: "total_sessions" as const, label: "Chat sessions", icon: MessageSquare },
  { key: "total_messages" as const, label: "Messages", icon: BarChart3 },
];

export default function AnalyticsPage() {
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getAnalytics()
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold">Analytics</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Overview of your knowledge base and conversations
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          const value = data?.[card.key] ?? 0;
          return (
            <motion.div
              key={card.key}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="glass-card p-6"
            >
              {loading ? (
                <Skeleton className="h-20 w-full" />
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{card.label}</span>
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <p className="mt-4 text-3xl font-bold">{value}</p>
                </>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
