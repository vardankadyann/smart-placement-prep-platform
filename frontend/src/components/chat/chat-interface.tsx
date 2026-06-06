"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Plus, Send, PanelRightClose, PanelRight } from "lucide-react";
import { api, type Message, type Source } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { MessageBubble } from "./message-bubble";
import { TypingIndicator } from "./typing-indicator";
import { SourceCard } from "./source-card";
import { cn } from "@/lib/utils";

const SUGGESTED = [
  "Explain the main concepts in simple terms",
  "Give me a step-by-step summary",
  "Create a short quiz based on the material",
  "What are the key takeaways?",
];

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sessionId, setSessionId] = useState<string | undefined>();
  const [sessions, setSessions] = useState<{ id: string; title: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [streamSources, setStreamSources] = useState<Source[]>([]);
  const [showSources, setShowSources] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingContent, scrollToBottom]);

  const loadSessions = useCallback(async () => {
    try {
      const list = await api.listSessions();
      setSessions(list.map((s) => ({ id: s.id, title: s.title })));
    } catch {
      /* backend offline */
    }
  }, []);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  const newChat = async () => {
    try {
      const { session_id } = await api.createSession();
      setSessionId(session_id);
      setMessages([]);
      setStreamingContent("");
      setStreamSources([]);
      loadSessions();
    } catch {
      setSessionId(undefined);
      setMessages([]);
    }
  };

  const loadSession = async (id: string) => {
    try {
      const session = await api.getSession(id);
      setSessionId(id);
      setMessages(session.messages);
      setStreamingContent("");
    } catch {
      /* ignore */
    }
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;
    const userMsg: Message = { role: "user", content: text.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    setStreamingContent("");
    setStreamSources([]);

    let full = "";
    let sources: Source[] = [];
    let sid = sessionId;

    try {
      for await (const event of api.streamChat(text.trim(), sessionId)) {
        if (event.type === "session" && event.session_id) {
          sid = event.session_id;
          setSessionId(event.session_id);
        }
        if (event.type === "sources" && event.sources) {
          sources = event.sources;
          setStreamSources(event.sources);
        }
        if (event.type === "token" && event.content) {
          full += event.content;
          setStreamingContent(full);
        }
      }
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: full, sources },
      ]);
      setStreamingContent("");
      loadSessions();
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I couldn't connect to the server. Make sure the backend is running.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <div className="flex h-[calc(100vh-3.5rem)]">
      {/* Chat history sidebar */}
      <aside className="hidden w-56 flex-col border-r border-border/50 bg-muted/30 md:flex">
        <div className="p-3">
          <Button variant="outline" className="w-full gap-2" onClick={newChat}>
            <Plus className="h-4 w-4" />
            New chat
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto px-2 pb-2">
          {sessions.map((s) => (
            <button
              key={s.id}
              onClick={() => loadSession(s.id)}
              className={cn(
                "mb-1 w-full truncate rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-accent",
                sessionId === s.id && "bg-accent font-medium"
              )}
            >
              {s.title}
            </button>
          ))}
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        <div className="flex items-center justify-end border-b border-border/50 px-2 py-1 md:hidden">
          <Button variant="ghost" size="sm" onClick={newChat}>
            <Plus className="h-4 w-4" /> New
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowSources(!showSources)}
          >
            {showSources ? (
              <PanelRightClose className="h-4 w-4" />
            ) : (
              <PanelRight className="h-4 w-4" />
            )}
          </Button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          <div className="flex flex-1 flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto">
              {messages.length === 0 && !loading && (
                <div className="flex h-full flex-col items-center justify-center px-4 text-center">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-lg"
                  >
                    <h2 className="mb-2 text-2xl font-semibold gradient-text">
                      What would you like to learn?
                    </h2>
                    <p className="mb-8 text-muted-foreground">
                      Ask questions about your uploaded course materials. I explain,
                      summarize, and quiz you — only from your documents.
                    </p>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {SUGGESTED.map((q) => (
                        <button
                          key={q}
                          onClick={() => sendMessage(q)}
                          className="glass-card rounded-xl px-4 py-3 text-left text-sm transition-colors hover:border-primary/30 hover:bg-primary/5"
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                </div>
              )}

              {messages.map((m, i) => (
                <MessageBubble
                  key={i}
                  role={m.role}
                  content={m.content}
                  sources={m.sources}
                />
              ))}

              {loading && streamingContent && (
                <MessageBubble
                  role="assistant"
                  content={streamingContent}
                  sources={streamSources}
                  isStreaming
                />
              )}
              {loading && !streamingContent && <TypingIndicator />}
              <div ref={bottomRef} />
            </div>

            <form
              onSubmit={handleSubmit}
              className="border-t border-border/50 bg-background/80 p-4 backdrop-blur"
            >
              <div className="mx-auto flex max-w-3xl gap-2 rounded-2xl border border-border/50 glass p-2 shadow-lg">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about your course materials..."
                  rows={1}
                  className="max-h-32 min-h-[44px] flex-1 resize-none bg-transparent px-3 py-2.5 text-sm outline-none placeholder:text-muted-foreground"
                  disabled={loading}
                />
                <Button
                  type="submit"
                  size="icon"
                  className="shrink-0 rounded-xl"
                  disabled={loading || !input.trim()}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </form>
          </div>

          {/* Sources panel */}
          {showSources && (
            <aside className="hidden w-72 flex-col border-l border-border/50 bg-muted/20 lg:flex">
              <div className="border-b border-border/50 p-4">
                <h3 className="font-semibold">Sources</h3>
                <p className="text-xs text-muted-foreground">
                  Citations from retrieved context
                </p>
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {streamSources.length > 0
                  ? streamSources.map((s, i) => (
                      <SourceCard key={s.id} source={s} index={i} />
                    ))
                  : messages
                      .filter((m) => m.role === "assistant" && m.sources?.length)
                      .slice(-1)[0]
                      ?.sources?.map((s, i) => (
                        <SourceCard key={s.id} source={s} index={i} />
                      ))}
                {!streamSources.length &&
                  !messages.some((m) => m.sources?.length) && (
                    <p className="text-sm text-muted-foreground">
                      Sources appear here when the assistant cites your documents.
                    </p>
                  )}
              </div>
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}
