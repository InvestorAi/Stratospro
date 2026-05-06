import React from 'react';
import { motion } from 'motion/react';

interface BrandLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function BrandLogo({ className = '', size = 'md' }: BrandLogoProps) {
  const sizeClasses = {
    sm: 'w-8 h-8 rounded-lg text-sm',
    md: 'w-10 h-10 rounded-xl text-xl',
    lg: 'w-12 h-12 rounded-2xl text-2xl',
  };

  return (
    <div className={`relative flex items-center justify-center overflow-hidden bg-gradient-to-br from-orange-600 via-orange-500 to-indigo-700 shadow-lg ${sizeClasses[size]} ${className}`}>
      {/* Abstract geometric background elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-0 w-full h-1/2 bg-white rotate-12 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-full h-1/2 bg-black -rotate-12 translate-y-1/2" />
      </div>
      
      {/* The Core Mark */}
      <motion.span 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 text-white font-black font-mono tracking-tighter"
      >
        B
      </motion.span>
      
      {/* Decorative "Intelligence" Node */}
      <div className="absolute bottom-1 right-1 w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] border border-white/20" />
      
      {/* Gloss overlay */}
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 pointer-events-none" />
    </div>
  );
}
