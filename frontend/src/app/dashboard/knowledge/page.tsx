"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FileText, Search, Trash2, Loader2 } from "lucide-react";
import { api, type Document } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

export default function KnowledgePage() {
  const [docs, setDocs] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const list = query.trim()
        ? await api.searchDocuments(query)
        : await api.listDocuments();
      setDocs(list);
    } catch {
      setDocs([]);
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    const t = setTimeout(load, query ? 300 : 0);
    return () => clearTimeout(t);
  }, [load, query]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this document and all its chunks?")) return;
    setDeleting(id);
    try {
      await api.deleteDocument(id);
      await load();
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-2xl font-semibold">Knowledge Base</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage uploaded PDFs and embedding status
        </p>

        <div className="relative mt-6">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search documents..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="mt-6 space-y-3">
          {loading &&
            Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full rounded-xl" />
            ))}

          {!loading && docs.length === 0 && (
            <div className="glass-card py-12 text-center text-muted-foreground">
              No documents yet. Upload PDFs to get started.
            </div>
          )}

          {docs.map((doc, i) => (
            <motion.div
              key={doc.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass-card flex items-center gap-4 p-4"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <FileText className="h-6 w-6" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{doc.filename}</p>
                <div className="mt-1 flex flex-wrap gap-3 text-xs text-muted-foreground">
                  <span>{doc.chunk_count} chunks</span>
                  <span
                    className={
                      doc.embedding_status === "completed"
                        ? "text-green-600 dark:text-green-400"
                        : ""
                    }
                  >
                    {doc.embedding_status}
                  </span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDelete(doc.id)}
                disabled={deleting === doc.id}
              >
                {deleting === doc.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4 text-red-500" />
                )}
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
