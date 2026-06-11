"use client";

import { motion } from "framer-motion";

const steps = [
  { step: "01", title: "Create Your Profile", desc: "Set up your academic background, skills, and target companies to get your initial readiness score." },
  { step: "02", title: "Analyze & Match", desc: "Upload your resume, paste job descriptions, and get AI-powered gap analysis and match scores." },
  { step: "03", title: "Follow Your Roadmap", desc: "Get a personalized 30/60/90-day learning plan with resources, projects, and milestones." },
  { step: "04", title: "Practice & Improve", desc: "Mock interviews, coding challenges, aptitude tests, and behavioral prep — all tracked on your dashboard." },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="px-4 py-20">
      <div className="mx-auto max-w-6xl">
        <div className="text-center">
          <h2 className="text-3xl font-bold md:text-4xl">How It <span className="gradient-text">Works</span></h2>
          <p className="mt-4 text-muted-foreground">From profile to placement-ready in four steps</p>
        </div>
        <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => (
            <motion.div
              key={s.step}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="relative"
            >
              <span className="text-5xl font-bold text-primary/20">{s.step}</span>
              <h3 className="mt-2 text-lg font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Testimonials() {
  const testimonials = [
    { name: "Priya Sharma", role: "CS Final Year, IIT Delhi", quote: "The resume-JD matching helped me tailor my applications. Got 3 interview calls in two weeks!" },
    { name: "Arjun Patel", role: "ECE Graduate, NIT Trichy", quote: "Voice mock interviews improved my confidence dramatically. The STAR feedback on behavioral answers is gold." },
    { name: "Sneha Reddy", role: "IT Intern Seeker", quote: "The 60-day roadmap kept me accountable. Went from 45 to 78 readiness score in two months." },
  ];

  return (
    <section className="px-4 py-20">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-center text-3xl font-bold md:text-4xl">Loved by <span className="gradient-text">Students</span></h2>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {testimonials.map((t) => (
            <div key={t.name} className="glass-card p-6">
              <p className="text-sm italic text-muted-foreground">&ldquo;{t.quote}&rdquo;</p>
              <div className="mt-4">
                <p className="font-semibold">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
