"use client";

import { motion } from "framer-motion";
import { Users, CreditCard, LayoutDashboard, Database, MessageSquare, LineChart, ArrowRight, Crown } from "lucide-react";

export function ProblemSolution() {
  const tools = [
    { icon: Users, label: "CRM", rotate: -12, x: -60, y: -40, color: "text-blue-400" },
    { icon: CreditCard, label: "Finance", rotate: 8, x: 40, y: -50, color: "text-green-400" },
    { icon: LayoutDashboard, label: "Booking", rotate: -5, x: -80, y: 30, color: "text-purple-400" },
    { icon: Database, label: "Inventory", rotate: 15, x: 50, y: 40, color: "text-yellow-400" },
    { icon: MessageSquare, label: "Support", rotate: -20, x: -20, y: 80, color: "text-red-400" },
    { icon: LineChart, label: "Marketing", rotate: 10, x: 80, y: -10, color: "text-pink-400" },
  ];

  return (
    <section className="py-24 bg-[#0A0B0F] border-t border-[#1F2230]/50 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-6">
            Every business runs six departments. <br className="hidden md:block" />
            <span className="text-gray-500">Most owners run them from six different apps.</span>
          </h2>
          <p className="text-lg text-gray-400">
            NexusOS AI gives you one — a team of AI employees who work like your best hires would.
          </p>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-center gap-12 md:gap-24 max-w-4xl mx-auto mt-20">
          
          {/* Scattered Tools */}
          <div className="relative w-64 h-64 flex items-center justify-center">
            {tools.map((tool, i) => {
              const Icon = tool.icon;
              return (
                <motion.div
                  key={i}
                  className="absolute bg-[#12141C] border border-[#1F2230] p-4 rounded-xl flex flex-col items-center gap-2 shadow-lg"
                  initial={{ opacity: 0, x: tool.x * 2, y: tool.y * 2, rotate: tool.rotate * 2 }}
                  whileInView={{ opacity: 1, x: tool.x, y: tool.y, rotate: tool.rotate }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.8, delay: i * 0.1, type: "spring", bounce: 0.4 }}
                >
                  <Icon className={tool.color} size={24} />
                  <span className="text-xs text-gray-400 font-medium">{tool.label}</span>
                </motion.div>
              );
            })}
          </div>

          {/* Arrow */}
          <motion.div 
            className="hidden md:flex flex-col items-center text-gray-600"
            initial={{ opacity: 0, scale: 0.5 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            <ArrowRight size={48} className="text-[#1F2230]" />
          </motion.div>
          <motion.div 
            className="md:hidden flex flex-col items-center text-gray-600"
            initial={{ opacity: 0, scale: 0.5 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            <ArrowRight size={48} className="text-[#1F2230] rotate-90" />
          </motion.div>

          {/* Unified AI */}
          <motion.div 
            className="relative w-64 h-64 flex items-center justify-center"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 1 }}
          >
            <div className="absolute inset-0 bg-indigo-500/10 rounded-full blur-3xl animate-pulse" />
            <div className="relative bg-[#12141C] border border-indigo-500/30 p-8 rounded-2xl flex flex-col items-center gap-4 shadow-[0_0_40px_rgba(79,70,229,0.2)]">
              <div className="w-16 h-16 rounded-full bg-gradient-accent flex items-center justify-center shadow-[0_0_20px_rgba(79,70,229,0.4)]">
                <Crown className="text-white" size={32} />
              </div>
              <div className="text-center">
                <h3 className="text-xl font-bold text-white tracking-tight">CEO AI</h3>
                <p className="text-sm text-indigo-400 font-medium">Your Single Interface</p>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
