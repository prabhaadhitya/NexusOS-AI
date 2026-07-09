"use client";

import { motion } from "framer-motion";
import { MessageSquarePlus, Route, Zap, FileCheck2 } from "lucide-react";

const STEPS = [
  {
    num: "01",
    title: "Ask a question",
    description: "Simply type what you want to know. 'Why did revenue drop this month?' or 'Do we need to order more supplies?'",
    icon: MessageSquarePlus
  },
  {
    num: "02",
    title: "Your CEO delegates",
    description: "The CEO AI instantly understands what departments are needed and routes your question to the right specialists.",
    icon: Route
  },
  {
    num: "03",
    title: "Your team works in parallel",
    description: "Sales, Finance, and Inventory AI agents investigate their respective data simultaneously, finding the root causes.",
    icon: Zap
  },
  {
    num: "04",
    title: "You get one clear answer",
    description: "The CEO AI reviews all findings and gives you a single executive summary with clear recommended actions.",
    icon: FileCheck2
  }
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 bg-[#0A0B0F] border-t border-[#1F2230]/50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-20">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-4">
            How it Works
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Stop digging through reports. Start asking questions.
          </p>
        </div>

        <div className="relative max-w-4xl mx-auto">
          {/* Desktop Connecting Line */}
          <div className="hidden md:block absolute top-12 left-12 right-12 h-0.5 bg-[#1F2230]" />
          
          {/* Mobile Connecting Line */}
          <div className="md:hidden absolute top-12 bottom-12 left-12 w-0.5 bg-[#1F2230]" />

          <div className="grid md:grid-cols-4 gap-10 md:gap-6 relative z-10">
            {STEPS.map((step, i) => {
              const Icon = step.icon;
              return (
                <motion.div 
                  key={step.num}
                  className="flex md:flex-col items-start md:items-center gap-6 md:gap-8"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.5, delay: i * 0.15 }}
                >
                  <div className="w-24 h-24 shrink-0 rounded-2xl bg-[#12141C] border border-[#1F2230] flex flex-col items-center justify-center relative shadow-lg group-hover:border-indigo-500/50 transition-colors">
                    <span className="absolute -top-3 bg-[#0A0B0F] px-2 text-xs font-mono font-bold text-indigo-400">
                      STEP {step.num}
                    </span>
                    <Icon size={32} className="text-gray-300" />
                  </div>
                  
                  <div className="md:text-center mt-2 md:mt-0">
                    <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
                    <p className="text-sm text-gray-400 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
