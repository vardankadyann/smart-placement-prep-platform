import { Navbar, Footer } from "@/components/landing/navbar";
import { Hero } from "@/components/landing/hero";
import { Features, GamificationFeature } from "@/components/landing/features";
import { HowItWorks, Testimonials } from "@/components/landing/how-it-works";
import { Pricing, FAQ, CTA } from "@/components/landing/pricing-faq";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <Hero />
        <Features />
        <GamificationFeature />
        <HowItWorks />
        <Testimonials />
        <Pricing />
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
