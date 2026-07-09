"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import Link from "next/link";
import { User, Crown, Activity } from "lucide-react";

const TYPING_SPEED = 50;
const QUERY = "Why did our revenue drop this month?";

export function LiveExample() {
  const [typedQuery, setTypedQuery] = useState("");
  const [showResponse, setShowResponse] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    
    const startAnimation = () => {
      setTypedQuery("");
      setShowResponse(false);
      setIsTyping(true);
      
      let i = 0;
      const typeChar = () => {
        if (i < QUERY.length) {
          setTypedQuery(QUERY.substring(0, i + 1));
          i++;
          timeout = setTimeout(typeChar, TYPING_SPEED);
        } else {
          setIsTyping(false);
          timeout = setTimeout(() => setShowResponse(true), 800);
        }
      };
      
      timeout = setTimeout(typeChar, 1000);
    };

    // Use IntersectionObserver to start animation when in view
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          startAnimation();
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );

    const element = document.getElementById("live-example-trigger");
    if (element) observer.observe(element);

    return () => {
      clearTimeout(timeout);
      observer.disconnect();
    };
  }, []);

  return (
    <section className="py-24 bg-[#0A0B0F] border-t border-[#1F2230]/50 relative">
      <div id="live-example-trigger" className="max-w-5xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          
          <div>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-6">
              See it in action
            </h2>
            <p className="text-lg text-gray-400 mb-8 leading-relaxed">
              Stop guessing why numbers are down. NexusOS AI instantly cross-references sales data, inventory levels, and marketing spend to give you the complete picture.
            </p>
            <Link 
              href="/dashboard"
              className="inline-flex items-center justify-center font-semibold text-white bg-gradient-accent px-8 py-3.5 rounded-full hover:opacity-90 transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-[0_0_15px_rgba(79,70,229,0.2)] hover:shadow-[0_0_25px_rgba(79,70,229,0.4)]"
            >
              Try it yourself
            </Link>
          </div>

          <div className="bg-[#12141C] border border-[#1F2230] rounded-2xl overflow-hidden shadow-2xl flex flex-col h-[400px]">
            {/* Header */}
            <div className="border-b border-[#1F2230] p-4 flex items-center justify-between bg-[#0A0B0F]/50">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
                  <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50" />
                </div>
                <span className="ml-4 text-xs font-mono text-gray-500">NexusOS Executive Dashboard</span>
              </div>
            </div>
            
            {/* Chat Body */}
            <div className="flex-1 p-6 overflow-y-auto flex flex-col gap-6">
              
              {/* User Message */}
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-[#1F2230] flex items-center justify-center shrink-0">
                  <User size={16} className="text-gray-400" />
                </div>
                <div className="bg-[#1F2230]/50 border border-[#1F2230] rounded-2xl rounded-tl-sm px-4 py-3 text-sm text-gray-200">
                  {typedQuery}
                  {isTyping && <span className="inline-block w-1.5 h-4 ml-1 bg-emerald-400 animate-pulse align-middle" />}
                </div>
              </div>

              {/* AI Response */}
              {showResponse && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-4"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-accent flex items-center justify-center shrink-0">
                    <Crown size={16} className="text-white" />
                  </div>
                  <div className="flex flex-col gap-3 w-full">
                    <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl rounded-tl-sm px-5 py-4 text-sm text-gray-200 leading-relaxed">
                      <p className="font-semibold text-white mb-2">Executive Summary:</p>
                      <p className="mb-4 text-gray-300">Revenue dropped by 12% this month due to two compounding factors identified by the Sales and Inventory departments:</p>
                      
                      <ul className="space-y-3 mb-4">
                        <li className="flex gap-2 text-gray-300">
                          <span className="text-indigo-400 font-bold">•</span>
                          <span><strong>Stockout:</strong> We ran out of our top-selling item (SKU-A) for 8 days, costing an estimated $4,200 in lost sales.</span>
                        </li>
                        <li className="flex gap-2 text-gray-300">
                          <span className="text-indigo-400 font-bold">•</span>
                          <span><strong>Marketing ROI:</strong> The recent ad campaign CAC increased by 22%, but conversion dropped.</span>
                        </li>
                      </ul>

                      <div className="bg-[#0A0B0F] rounded-lg p-3 border border-[#1F2230] flex items-start gap-3 mt-4">
                        <Activity className="text-emerald-400 mt-0.5" size={16} />
                        <div>
                          <p className="text-xs font-bold text-white uppercase tracking-wider mb-1">Recommended Action</p>
                          <p className="text-xs text-gray-400">Expedite SKU-A reorder via rush shipping and pause the underperforming ad campaign.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
