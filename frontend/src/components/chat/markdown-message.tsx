"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark, oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Check, Copy } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

function CodeBlock({ children, className }: { children: string; className?: string }) {
  const [copied, setCopied] = useState(false);
  const { resolvedTheme } = useTheme();
  const match = /language-(\w+)/.exec(className || "");
  const lang = match ? match[1] : "text";

  const copy = async () => {
    await navigator.clipboard.writeText(children);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="group relative my-3 overflow-hidden rounded-xl border border-border/50">
      <div className="flex items-center justify-between bg-muted/50 px-3 py-1.5 text-xs text-muted-foreground">
        <span>{lang}</span>
        <Button variant="ghost" size="sm" className="h-7 gap-1" onClick={copy}>
          {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
          {copied ? "Copied" : "Copy"}
        </Button>
      </div>
      <SyntaxHighlighter
        language={lang}
        style={resolvedTheme === "dark" ? oneDark : oneLight}
        customStyle={{ margin: 0, borderRadius: 0, fontSize: "0.85rem" }}
      >
        {children}
      </SyntaxHighlighter>
    </div>
  );
}

export function MarkdownMessage({ content }: { content: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      className="prose prose-sm dark:prose-invert max-w-none prose-p:leading-relaxed prose-pre:p-0 prose-pre:bg-transparent"
      components={{
        code({ className, children, ...props }) {
          const text = String(children).replace(/\n$/, "");
          const inline = !className;
          if (inline) {
            return (
              <code
                className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm"
                {...props}
              >
                {children}
              </code>
            );
          }
          return <CodeBlock className={className}>{text}</CodeBlock>;
        },
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
