"use client";

import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SignUpButton } from "@clerk/nextjs";

const plans = [
  {
    name: "Free",
    price: "₹0",
    period: "forever",
    features: ["Profile & Readiness Score", "1 Resume Analysis/month", "Basic Interview Questions", "Career Mentor (5 chats/day)"],
    cta: "Get Started",
    popular: false,
  },
  {
    name: "Pro",
    price: "₹499",
    period: "/month",
    features: ["Unlimited Resume & JD Analysis", "Voice Mock Interviews", "Coding & Aptitude Prep", "Personalized Roadmaps", "Analytics Dashboard", "Priority AI Responses"],
    cta: "Start Pro Trial",
    popular: true,
  },
  {
    name: "Campus",
    price: "Custom",
    period: "",
    features: ["Everything in Pro", "Placement Cell Dashboard", "Bulk Student Accounts", "Custom Company Prep", "Dedicated Support", "Analytics for TPO"],
    cta: "Contact Sales",
    popular: false,
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="px-4 py-20">
      <div className="mx-auto max-w-6xl">
        <div className="text-center">
          <h2 className="text-3xl font-bold md:text-4xl">Simple, <span className="gradient-text">Transparent</span> Pricing</h2>
          <p className="mt-4 text-muted-foreground">Start free, upgrade when you&apos;re ready</p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`glass-card relative p-8 ${plan.popular ? "border-primary/50 ring-2 ring-primary/20" : ""}`}
            >
              {plan.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-0.5 text-xs font-medium text-primary-foreground">
                  Most Popular
                </span>
              )}
              <h3 className="text-lg font-semibold">{plan.name}</h3>
              <div className="mt-4">
                <span className="text-4xl font-bold">{plan.price}</span>
                <span className="text-muted-foreground">{plan.period}</span>
              </div>
              <ul className="mt-6 space-y-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    {f}
                  </li>
                ))}
              </ul>
              <SignUpButton mode="modal">
                <Button className="mt-8 w-full" variant={plan.popular ? "default" : "outline"}>
                  {plan.cta}
                </Button>
              </SignUpButton>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function FAQ() {
  const faqs = [
    { q: "How is this different from LeetCode or GeeksforGeeks?", a: "We provide end-to-end placement preparation — not just coding. Resume analysis, JD matching, mock interviews, roadmaps, and readiness tracking in one platform." },
    { q: "Which AI models power the platform?", a: "We use Claude and OpenAI APIs with a specialized agent architecture — each module has a dedicated AI agent orchestrated for optimal results." },
    { q: "Can I use this for off-campus placements?", a: "Absolutely. Analyze any job description, match your resume, and get a personalized preparation roadmap for any company or role." },
    { q: "Is my resume data secure?", a: "Yes. Files are stored securely via UploadThing, APIs are authenticated via Clerk, and all data is encrypted in PostgreSQL." },
    { q: "Do you support voice mock interviews?", a: "Yes! Use your browser's speech recognition to practice answers and get AI evaluation on communication, confidence, and clarity." },
  ];

  return (
    <section id="faq" className="px-4 py-20">
      <div className="mx-auto max-w-3xl">
        <h2 className="text-center text-3xl font-bold md:text-4xl">Frequently Asked <span className="gradient-text">Questions</span></h2>
        <div className="mt-12 space-y-4">
          {faqs.map((faq) => (
            <details key={faq.q} className="glass-card group p-6">
              <summary className="cursor-pointer font-medium">{faq.q}</summary>
              <p className="mt-3 text-sm text-muted-foreground">{faq.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

export function CTA() {
  return (
    <section className="px-4 py-20">
      <div className="mx-auto max-w-4xl">
        <div className="glass-card bg-gradient-to-br from-primary/10 to-indigo-500/10 p-12 text-center">
          <h2 className="text-3xl font-bold md:text-4xl">Ready to Ace Your <span className="gradient-text">Placement</span>?</h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Join thousands of students using AI Placement Copilot to land their dream jobs.
          </p>
          <SignUpButton mode="modal">
            <Button size="lg" className="mt-8">Start Your Journey — It&apos;s Free</Button>
          </SignUpButton>
        </div>
      </div>
    </section>
  );
}
