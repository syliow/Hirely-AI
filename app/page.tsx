"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { TrendingUp, ArrowRight, Upload } from 'lucide-react';

// Components
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/Footer';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { PricingSection } from '@/components/landing/PricingSection';

export default function Home() {
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // --- Render Helpers ---
  const LandingHero = () => (
    <div className="relative min-h-[90vh] flex flex-col items-center justify-center text-center px-4 overflow-hidden pt-20">
      
      {/* Background Elements */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500/10 rounded-full blur-[150px] animate-pulse-slow pointer-events-none" />
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-violet-500/10 rounded-full blur-[120px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 max-w-5xl mx-auto space-y-8"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md text-slate-300 text-xs font-bold uppercase tracking-widest mb-4 hover:bg-white/10 transition-colors cursor-default">
           <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> AI 2.0 Now Live
        </div>

        <h1 className="text-5xl/tight md:text-8xl/tight font-black tracking-tighter text-white">
          Your Resume, <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-indigo-400 to-purple-400 animate-gradient">
            But Unignorable.
          </span>
        </h1>
        
        <p className="text-lg md:text-2xl text-slate-400 max-w-3xl mx-auto leading-relaxed">
          The only AI resume auditor engineered by <span className="text-white font-bold">real hiring managers</span>. 
          Get the exact feedback you need to land interviews at top tech companies.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
          <Link href="/app" className="group relative px-8 py-5 bg-white text-slate-950 font-black text-sm uppercase tracking-widest rounded-2xl hover:bg-slate-200 transition-all shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] hover:shadow-[0_0_60px_-15px_rgba(255,255,255,0.5)] flex items-center gap-2">
             <span className="relative z-10 flex items-center gap-2">
               Upload Resume <Upload className="w-4 h-4" />
             </span>
          </Link>
          
          <Link href="/app" className="px-8 py-5 bg-transparent border border-white/10 text-white font-bold text-sm uppercase tracking-widest rounded-2xl hover:bg-white/5 transition-all flex items-center gap-2">
            Try Demo <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Visual Mockup */}
        <motion.div 
          initial={{ opacity: 0, y: 50, rotateX: 10 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{ delay: 0.4, duration: 1 }}
          className="mt-20 relative w-full max-w-4xl mx-auto aspect-video bg-slate-900 rounded-t-[32px] border-t border-x border-white/10 shadow-2xl overflow-hidden group"
        >
           <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950 z-0" />
           
           {/* UI Mockup Content */}
           <div className="relative z-10 p-8 grid grid-cols-12 gap-6 h-full opacity-60 group-hover:opacity-100 transition-opacity duration-700">
              <div className="col-span-4 space-y-4">
                 <div className="h-32 rounded-2xl bg-white/5 border border-white/5" />
                 <div className="h-64 rounded-2xl bg-white/5 border border-white/5" />
              </div>
              <div className="col-span-8 space-y-4">
                 <div className="h-12 w-3/4 rounded-xl bg-violet-500/20 border border-violet-500/30" />
                 <div className="space-y-2">
                    <div className="h-4 w-full rounded bg-white/5" />
                    <div className="h-4 w-5/6 rounded bg-white/5" />
                    <div className="h-4 w-4/6 rounded bg-white/5" />
                 </div>
                 <div className="h-48 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 mt-8 relative overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center">
                       <span className="text-5xl font-black text-emerald-500">92%</span>
                    </div>
                 </div>
              </div>
           </div>

           {/* Floating Badge */}
           <motion.div 
             animate={{ y: [0, -10, 0] }}
             transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
             className="absolute top-1/4 -right-8 bg-slate-800/80 backdrop-blur-md p-4 rounded-2xl border border-white/10 shadow-xl z-20"
           >
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold">A+</div>
                 <div>
                    <p className="text-xs text-slate-400 font-bold uppercase">ATS Score</p>
                    <p className="text-white font-bold">Excellent</p>
                 </div>
              </div>
           </motion.div>
        </motion.div>

      </motion.div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#020617] text-slate-200 font-sans selection:bg-violet-500/30">
      
      <Header 
        onReset={() => {}} 
        onStartTour={() => {}} 
        onToggleTheme={() => setIsDarkMode(!isDarkMode)} 
        isDarkMode={isDarkMode} 
      />

      <main className="flex-1 w-full relative z-10">
          {/* Landing Page View */}
          <div className="space-y-0 pb-20">
            <LandingHero />
            <div id="features">
              <FeaturesSection />
            </div>
            <PricingSection />
          </div>
      </main>

      <Footer />
    </div>
  );
}
