import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { ProblemSolution } from "@/components/landing/ProblemSolution";
import { MeetTheWorkforce } from "@/components/landing/MeetTheWorkforce";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { LiveExample } from "@/components/landing/LiveExample";
import { IndustriesStrip } from "@/components/landing/IndustriesStrip";
import { FinalCTA } from "@/components/landing/FinalCTA";
import { Footer } from "@/components/landing/Footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0A0B0F] text-foreground font-sans selection:bg-indigo-500/30 selection:text-white">
      <Navbar />
      <main>
        <Hero />
        <ProblemSolution />
        <MeetTheWorkforce />
        <HowItWorks />
        <LiveExample />
        <IndustriesStrip />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}
