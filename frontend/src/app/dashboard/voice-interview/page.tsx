"use client";

import { useState, useRef } from "react";
import { Mic, MicOff } from "lucide-react";
import { PageHeader, ScoreCard } from "@/components/dashboard/shared";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const SAMPLE_QUESTIONS = [
  "Tell me about yourself and why you're interested in this role.",
  "Describe a challenging project you worked on and how you overcame obstacles.",
  "Explain a technical concept you recently learned to a non-technical person.",
];

export default function VoiceInterviewPage() {
  const [question, setQuestion] = useState(SAMPLE_QUESTIONS[0]);
  const [transcript, setTranscript] = useState("");
  const [listening, setListening] = useState(false);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);
  const recognitionRef = useRef<{ stop: () => void } | null>(null);

  const startListening = () => {
    const win = window as Window & {
      SpeechRecognition?: new () => SpeechRecognitionInstance;
      webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
    };
    const SpeechRecognitionCtor = win.SpeechRecognition || win.webkitSpeechRecognition;
    if (!SpeechRecognitionCtor) {
      alert("Speech recognition not supported. Type your answer instead.");
      return;
    }
    const recognition = new SpeechRecognitionCtor();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let text = "";
      for (let i = 0; i < event.results.length; i++) {
        text += event.results[i][0].transcript;
      }
      setTranscript(text);
    };
    recognition.onend = () => setListening(false);
    recognition.start();
    recognitionRef.current = recognition;
    setListening(true);
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setListening(false);
  };

  const evaluate = async () => {
    if (!transcript.trim()) return;
    setLoading(true);
    const res = await fetch("/api/voice-interview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question, transcript }),
    });
    const data = await res.json();
    setResult(data.evaluation ?? null);
    setLoading(false);
  };

  return (
    <>
      <PageHeader title="Voice Mock Interview" description="Speak your answer and get AI evaluation on communication and clarity" />

      <Card className="mb-6">
        <CardHeader><CardTitle>Interview Question</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {SAMPLE_QUESTIONS.map((q) => (
              <Button key={q} variant="outline" size="sm" onClick={() => { setQuestion(q); setTranscript(""); setResult(null); }}>
                {q.slice(0, 40)}...
              </Button>
            ))}
          </div>
          <p className="rounded-lg bg-muted/50 p-4 text-sm">{question}</p>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardContent className="space-y-4 py-6">
          <Label>Your Answer</Label>
          <Textarea value={transcript} onChange={(e) => setTranscript(e.target.value)} placeholder="Speak or type your answer..." className="min-h-[120px]" />
          <div className="flex gap-2">
            <Button variant={listening ? "secondary" : "outline"} onClick={listening ? stopListening : startListening}>
              {listening ? <><MicOff className="h-4 w-4" /> Stop</> : <><Mic className="h-4 w-4" /> Start Speaking</>}
            </Button>
            <Button onClick={evaluate} disabled={loading || !transcript.trim()}>{loading ? "Evaluating..." : "Evaluate Answer"}</Button>
          </div>
        </CardContent>
      </Card>

      {result && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <ScoreCard title="Communication" score={(result.communicationScore as number) ?? 0} />
            <ScoreCard title="Confidence" score={(result.confidenceScore as number) ?? 0} />
            <ScoreCard title="Technical" score={(result.technicalScore as number) ?? 0} />
            <ScoreCard title="Clarity" score={(result.clarityScore as number) ?? 0} />
          </div>
          <Card>
            <CardHeader><CardTitle>Feedback</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p>{result.feedback as string}</p>
              <div><p className="font-medium text-primary">Suggested Better Answer</p><p className="text-muted-foreground">{result.suggestedAnswer as string}</p></div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}

interface SpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  onresult: (event: SpeechRecognitionEvent) => void;
  onend: () => void;
  start: () => void;
  stop: () => void;
}

interface SpeechRecognitionEvent {
  results: { length: number; [index: number]: { [index: number]: { transcript: string } } };
}
