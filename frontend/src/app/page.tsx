import { Navbar } from "@/components/landing/navbar";
import { Hero } from "@/components/landing/hero";
import { Features } from "@/components/landing/features";
import { HowItWorks } from "@/components/landing/how-it-works";
import { CTA } from "@/components/landing/cta";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <div id="features">
        <Features />
      </div>
      <div id="how-it-works">
        <HowItWorks />
      </div>
      <section className="px-4 py-16">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-2xl font-bold">Built for students & educators</h2>
          <p className="mt-4 text-muted-foreground">
            Grounded answers prevent hallucinations. Teaching mode adapts explanations to your
            level. Multi-document retrieval searches across your entire library.
          </p>
        </div>
      </section>
      <CTA />
      <footer className="border-t border-border/50 py-8 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} TeachAI. Gemini + ChromaDB + FastAPI + Next.js
      </footer>
    </div>
  );
}
