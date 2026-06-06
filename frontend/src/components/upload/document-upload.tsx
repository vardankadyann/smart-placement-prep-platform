"use client";

import { useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, FileUp, Loader2, Upload } from "lucide-react";
import { api } from "@/lib/api";
import { formatBytes, cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

type UploadState = "idle" | "uploading" | "processing" | "success" | "error";

export function DocumentUpload() {
  const [dragOver, setDragOver] = useState(false);
  const [state, setState] = useState<UploadState>("idle");
  const [progress, setProgress] = useState(0);
  const [fileInfo, setFileInfo] = useState<{ name: string; size: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ chunks: number; filename: string } | null>(null);

  const processFile = async (file: File) => {
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      setError("Only PDF files are supported.");
      setState("error");
      return;
    }

    setFileInfo({ name: file.name, size: file.size });
    setState("uploading");
    setProgress(0);
    setError(null);
    setResult(null);

    try {
      setState("processing");
      const doc = await api.uploadDocument(file, setProgress);
      setResult({ chunks: doc.chunk_count, filename: doc.filename });
      setState("success");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
      setState("error");
    }
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, []);

  return (
    <div className="mx-auto max-w-2xl p-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={cn(
          "glass-card flex min-h-[320px] flex-col items-center justify-center border-2 border-dashed p-12 transition-colors",
          dragOver ? "border-primary bg-primary/5" : "border-border/60"
        )}
      >
        <AnimatePresence mode="wait">
          {state === "success" ? (
            <motion.div
              key="success"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex flex-col items-center text-center"
            >
              <CheckCircle2 className="mb-4 h-16 w-16 text-green-500" />
              <h3 className="text-xl font-semibold">Upload complete!</h3>
              <p className="mt-2 text-muted-foreground">
                {result?.filename} — {result?.chunks} chunks indexed
              </p>
              <Button className="mt-6" onClick={() => setState("idle")}>
                Upload another
              </Button>
            </motion.div>
          ) : state === "uploading" || state === "processing" ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="w-full max-w-sm text-center"
            >
              <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-primary" />
              <p className="font-medium">
                {state === "uploading" ? "Uploading..." : "Processing PDF..."}
              </p>
              {fileInfo && (
                <p className="mt-1 text-sm text-muted-foreground">
                  {fileInfo.name} · {formatBytes(fileInfo.size)}
                </p>
              )}
              <Progress value={progress} className="mt-4" />
              <p className="mt-2 text-xs text-muted-foreground">
                Extracting text → chunking → embedding → storing in ChromaDB
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center text-center"
            >
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                <FileUp className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Drop your PDF here</h3>
              <p className="mt-2 max-w-sm text-muted-foreground">
                Drag and drop course materials, or click to browse. Max 25MB per file.
              </p>
              <label className="mt-6">
                <input
                  type="file"
                  accept=".pdf,application/pdf"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) processFile(f);
                  }}
                />
                <Button asChild>
                  <span className="cursor-pointer gap-2">
                    <Upload className="h-4 w-4" />
                    Choose file
                  </span>
                </Button>
              </label>
            </motion.div>
          )}
        </AnimatePresence>

        {error && (
          <p className="mt-4 text-sm text-red-500">{error}</p>
        )}
      </motion.div>
    </div>
  );
}
