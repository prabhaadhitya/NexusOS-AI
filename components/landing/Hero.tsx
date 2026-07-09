"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { AgentNetwork } from "./AgentNetwork";

export function Hero() {
  return (
    <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden flex flex-col justify-center min-h-[90vh]">
      {/* Subtle background texture */}
      <div 
        className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)',
          backgroundSize: '24px 24px',
          maskImage: 'linear-gradient(to bottom, black 40%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, black 40%, transparent 100%)'
        }}
      />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10 grid lg:grid-cols-2 gap-16 items-center">
        <div className="max-w-2xl text-center lg:text-left order-2 lg:order-1">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
          >
            <span className="inline-block py-1 px-3 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-mono font-medium mb-6 uppercase tracking-wider">
              The Next Evolution of Business Management
            </span>
          </motion.div>
          
          <motion.h1 
            className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white mb-6 leading-[1.1]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
          >
            Run your business with <span className="text-gradient">AI employees,</span> not software.
          </motion.h1>
          
          <motion.p 
            className="text-lg md:text-xl text-gray-400 mb-10 leading-relaxed max-w-xl mx-auto lg:mx-0"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
          >
            NexusOS AI replaces scattered business tools with one AI CEO that manages a full team of specialized AI agents. Ask a question, and they do the work.
          </motion.p>
          
          <motion.div 
            className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4, ease: "easeOut" }}
          >
            <Link 
              href="/dashboard"
              className="w-full sm:w-auto text-center font-semibold text-white bg-gradient-accent px-8 py-4 rounded-full hover:opacity-90 transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.5)] transform hover:-translate-y-0.5"
            >
              Try the Demo
            </Link>
            <Link 
              href="#how-it-works"
              className="w-full sm:w-auto text-center font-medium text-white bg-[#12141C] border border-[#1F2230] px-8 py-4 rounded-full hover:bg-[#1A1D27] transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              See How It Works
            </Link>
          </motion.div>
        </div>
        
        <motion.div 
          className="order-1 lg:order-2 lg:h-[500px] flex items-center justify-center relative"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          <AgentNetwork />
        </motion.div>
      </div>
    </section>
  );
}
