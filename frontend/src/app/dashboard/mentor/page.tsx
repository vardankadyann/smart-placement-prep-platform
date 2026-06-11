"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Bot } from "lucide-react";
import { PageHeader } from "@/components/dashboard/shared";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Message {
  role: string;
  content: string;
}

export default function MentorPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sessionId, setSessionId] = useState<string>();
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const send = async () => {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setLoading(true);

    const res = await fetch("/api/mentor", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: userMsg, sessionId }),
    });
    const data = await res.json();
    if (data.sessionId) setSessionId(data.sessionId);
    setMessages((prev) => [...prev, { role: "assistant", content: data.reply ?? "Sorry, something went wrong." }]);
    setLoading(false);
  };

  return (
    <>
      <PageHeader title="Career Mentor" description="Your 24/7 AI assistant for placement and career guidance" />

      <Card className="flex h-[calc(100vh-220px)] flex-col">
        <CardContent className="flex flex-1 flex-col p-4">
          <div className="flex-1 space-y-4 overflow-y-auto pb-4">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
                <Bot className="mb-4 h-12 w-12 opacity-50" />
                <p>Ask me about resumes, interviews, skill development, or placement strategy.</p>
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${m.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                  {m.content}
                </div>
              </div>
            ))}
            {loading && <div className="text-sm text-muted-foreground animate-pulse">Mentor is thinking...</div>}
            <div ref={bottomRef} />
          </div>
          <div className="flex gap-2 border-t border-border/50 pt-4">
            <Input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder="Ask your career mentor..." disabled={loading} />
            <Button onClick={send} disabled={loading || !input.trim()} size="icon"><Send className="h-4 w-4" /></Button>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
