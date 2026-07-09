"use client";

import { motion } from "framer-motion";
import { TrendingUp, DollarSign, Package, Megaphone, Headphones, BarChart3 } from "lucide-react";

const AGENTS = [
  {
    name: "Sales AI",
    icon: TrendingUp,
    description: "Tracks active leads, suggests optimized pricing, and forecasts upcoming revenue opportunities.",
    color: "#10B981", // Emerald
    hoverClass: "hover:border-emerald-500/50 hover:shadow-[0_0_30px_rgba(16,185,129,0.15)]",
    iconBg: "bg-emerald-500/10 text-emerald-400"
  },
  {
    name: "Finance AI",
    icon: DollarSign,
    description: "Monitors cash flow, audits expenses, and flags unusual spending before it becomes a problem.",
    color: "#4F46E5", // Indigo
    hoverClass: "hover:border-indigo-500/50 hover:shadow-[0_0_30px_rgba(79,70,229,0.15)]",
    iconBg: "bg-indigo-500/10 text-indigo-400"
  },
  {
    name: "Inventory AI",
    icon: Package,
    description: "Tracks stock levels in real-time and alerts you to reorder before you run out of top sellers.",
    color: "#F59E0B", // Amber
    hoverClass: "hover:border-amber-500/50 hover:shadow-[0_0_30px_rgba(245,158,11,0.15)]",
    iconBg: "bg-amber-500/10 text-amber-400"
  },
  {
    name: "Marketing AI",
    icon: Megaphone,
    description: "Analyzes customer demographics and suggests targeted campaigns that actually convert.",
    color: "#EC4899", // Pink
    hoverClass: "hover:border-pink-500/50 hover:shadow-[0_0_30px_rgba(236,72,153,0.15)]",
    iconBg: "bg-pink-500/10 text-pink-400"
  },
  {
    name: "Support AI",
    icon: Headphones,
    description: "Reads customer feedback, identifies recurring complaints, and suggests operational fixes.",
    color: "#06B6D4", // Cyan
    hoverClass: "hover:border-cyan-500/50 hover:shadow-[0_0_30px_rgba(6,182,212,0.15)]",
    iconBg: "bg-cyan-500/10 text-cyan-400"
  },
  {
    name: "Analysis AI",
    icon: BarChart3,
    description: "Connects the dots between departments to give you high-level strategic recommendations.",
    color: "#8B5CF6", // Violet
    hoverClass: "hover:border-violet-500/50 hover:shadow-[0_0_30px_rgba(139,92,246,0.15)]",
    iconBg: "bg-violet-500/10 text-violet-400"
  }
];

export function MeetTheWorkforce() {
  return (
    <section id="workforce" className="py-24 bg-[#0A0B0F] relative">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-16">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-4">
            Your AI Employees
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl">
            Specialized experts that work 24/7, analyze your live data, and report directly to your CEO AI.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {AGENTS.map((agent, i) => {
            const Icon = agent.icon;
            return (
              <motion.div
                key={agent.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className={`group bg-[#12141C] border border-[#1F2230] rounded-2xl p-8 transition-all duration-300 transform hover:-translate-y-1 ${agent.hoverClass}`}
              >
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-6 ${agent.iconBg}`}>
                  <Icon size={28} />
                </div>
                <h3 className="text-xl font-bold text-white mb-3 tracking-tight">{agent.name}</h3>
                <p className="text-gray-400 leading-relaxed">
                  {agent.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
