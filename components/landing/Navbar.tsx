"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.header
      className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${
        scrolled ? "bg-[#0A0B0F]/80 backdrop-blur-md border-b border-[#1F2230]" : "bg-transparent"
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded">
          <div className="w-8 h-8 rounded bg-gradient-accent flex items-center justify-center">
            <span className="text-white font-bold tracking-tighter text-lg">N</span>
          </div>
          <span className="text-xl font-bold tracking-tight text-white group-hover:text-indigo-400 transition-colors">
            NexusOS AI
          </span>
        </Link>
        
        <nav className="hidden md:flex items-center gap-8">
          <Link href="#how-it-works" className="text-sm font-medium text-gray-400 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded px-2 py-1">
            How it Works
          </Link>
          <Link href="#workforce" className="text-sm font-medium text-gray-400 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded px-2 py-1">
            Workforce
          </Link>
          <Link href="#industries" className="text-sm font-medium text-gray-400 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded px-2 py-1">
            Industries
          </Link>
        </nav>
        
        <div className="flex items-center gap-4 w-[160px] justify-end">
          {/* Space for future login buttons */}
          <Link 
            href="/dashboard"
            className="text-sm font-medium text-white bg-gradient-accent hover:opacity-90 px-5 py-2.5 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-[0_0_15px_rgba(79,70,229,0.3)] hover:shadow-[0_0_20px_rgba(79,70,229,0.5)]"
          >
            Try the Demo
          </Link>
        </div>
      </div>
    </motion.header>
  );
}
