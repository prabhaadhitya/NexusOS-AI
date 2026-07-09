"use client";

import { motion } from "framer-motion";
import { TrendingUp, DollarSign, Package, Megaphone, Headphones, BarChart3, Crown } from "lucide-react";
import { useEffect, useState } from "react";

const DEPARTMENTS = [
  { name: "Sales", icon: TrendingUp, angle: -90, color: "#10B981" }, // Emerald
  { name: "Finance", icon: DollarSign, angle: -30, color: "#4F46E5" }, // Indigo
  { name: "Inventory", icon: Package, angle: 30, color: "#F59E0B" }, // Amber
  { name: "Marketing", icon: Megaphone, angle: 90, color: "#EC4899" }, // Pink
  { name: "Support", icon: Headphones, angle: 150, color: "#06B6D4" }, // Cyan
  { name: "Analysis", icon: BarChart3, angle: 210, color: "#8B5CF6" }, // Violet
];

export function AgentNetwork() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  
  // Randomly activate a node to simulate activity
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex(Math.floor(Math.random() * DEPARTMENTS.length));
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  const centerX = 200;
  const centerY = 200;
  const radius = 130;

  return (
    <div className="relative w-full max-w-[400px] aspect-square mx-auto flex items-center justify-center">
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 400" preserveAspectRatio="xMidYMid meet">
        {DEPARTMENTS.map((dept, i) => {
          const rad = (dept.angle * Math.PI) / 180;
          const x = centerX + radius * Math.cos(rad);
          const y = centerY + radius * Math.sin(rad);
          
          return (
            <g key={`path-${i}`}>
              {/* Static line */}
              <line 
                x1={centerX} y1={centerY} x2={x} y2={y} 
                stroke="#1F2230" strokeWidth="2" strokeDasharray="4 4"
              />
              {/* Animated line (only active on selected node) */}
              <motion.line 
                x1={centerX} y1={centerY} x2={x} y2={y}
                stroke={dept.color} strokeWidth="2"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ 
                  pathLength: activeIndex === i ? [0, 1, 0] : 0, 
                  opacity: activeIndex === i ? [0, 1, 0] : 0 
                }}
                transition={{ duration: 2, ease: "easeInOut", repeat: activeIndex === i ? 1 : 0 }}
              />
              {/* Particle traveling */}
              <motion.circle
                r="3"
                fill={dept.color}
                initial={{ cx: centerX, cy: centerY, opacity: 0 }}
                animate={{
                  cx: [centerX, x, centerX],
                  cy: [centerY, y, centerY],
                  opacity: [0, 1, 1, 0],
                }}
                transition={{
                  duration: 4,
                  ease: "linear",
                  repeat: Infinity,
                  delay: i * 0.7, // Staggered
                }}
              />
            </g>
          );
        })}
      </svg>
      
      {/* Department Nodes */}
      {DEPARTMENTS.map((dept, i) => {
        const rad = (dept.angle * Math.PI) / 180;
        const x = centerX + radius * Math.cos(rad);
        const y = centerY + radius * Math.sin(rad);
        const isActive = activeIndex === i;
        const Icon = dept.icon;
        
        return (
          <motion.div
            key={`node-${i}`}
            className="absolute flex flex-col items-center justify-center"
            style={{ 
              left: `calc(${(x / 400) * 100}% - 24px)`, 
              top: `calc(${(y / 400) * 100}% - 24px)` 
            }}
            animate={{ scale: isActive ? 1.15 : 1 }}
            transition={{ duration: 0.4, ease: "backOut" }}
          >
            <div 
              className="w-12 h-12 rounded-full flex items-center justify-center bg-[#12141C] border border-[#1F2230] z-10 relative overflow-hidden"
              style={{
                boxShadow: isActive ? `0 0 20px ${dept.color}60` : 'none',
                borderColor: isActive ? dept.color : '#1F2230'
              }}
            >
              {isActive && (
                <motion.div 
                  className="absolute inset-0 opacity-20"
                  style={{ backgroundColor: dept.color }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.2 }}
                  exit={{ opacity: 0 }}
                />
              )}
              <Icon size={20} color={isActive ? dept.color : '#9CA3AF'} className="z-20 relative" />
            </div>
            <div className="absolute top-14 text-center w-24">
              <span className={`text-[10px] font-mono font-medium tracking-wide ${isActive ? 'text-white' : 'text-gray-500'}`}>
                {dept.name}
              </span>
            </div>
          </motion.div>
        );
      })}
      
      {/* CEO Node (Center) */}
      <div className="absolute z-20 flex flex-col items-center">
        <div className="relative">
          <motion.div 
            className="absolute -inset-4 bg-indigo-500/20 rounded-full blur-xl"
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />
          <div className="w-16 h-16 rounded-full bg-gradient-accent flex items-center justify-center shadow-[0_0_30px_rgba(79,70,229,0.5)] z-20 relative border border-white/20">
            <Crown className="text-white" size={28} />
          </div>
        </div>
        <div className="mt-4 bg-[#12141C]/80 backdrop-blur border border-[#1F2230] px-3 py-1 rounded-full shadow-lg">
          <span className="text-xs font-mono font-bold text-white tracking-widest">CEO AI</span>
        </div>
      </div>
    </div>
  );
}
