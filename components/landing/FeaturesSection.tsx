"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Bot, 
  Search, 
  Zap, 
  ShieldCheck, 
  FileText, 
  TrendingUp, 
  Cpu
} from 'lucide-react';

export const FeaturesSection = () => {
  return (
    <section className="py-32 relative overflow-hidden bg-slate-950">
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/4 w-[500px] h-[500px] bg-violet-600/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="mb-20 space-y-4 max-w-3xl">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-6xl font-black tracking-tighter text-white"
          >
            Unfair Advantage <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-400">
              Engineered for You.
            </span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg text-slate-400"
          >
            We don't just "check" your resume. We break it down using the same AI logic used by Fortune 500 hiring systems.
          </motion.p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 auto-rows-[300px]">
          
          {/* Card 1: Large Core Feature */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="md:col-span-2 row-span-1 md:row-span-2 bg-gradient-to-br from-violet-500/10 to-transparent border border-white/10 rounded-[32px] p-8 md:p-12 relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-noise opacity-20 pointer-events-none" />
            <div className="relative z-10 h-full flex flex-col justify-between">
              <div>
                <div className="w-14 h-14 bg-violet-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-violet-500/30">
                  <Bot className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-3xl font-bold text-white mb-4">Hiring Manager Persona</h3>
                <p className="text-slate-400 text-lg leading-relaxed max-w-md">
                  Most tools check for typos. Our AI simulates a grumpy hiring manager with 10 years of experience, ruthlessly cutting fluff to leave only impact.
                </p>
              </div>
              <div className="mt-8 relative h-40 w-full bg-slate-900/50 rounded-xl border border-white/5 overflow-hidden backdrop-blur-sm">
                 {/* Abstract output visualization */}
                 <div className="absolute top-4 left-4 right-4 space-y-3 opacity-60">
                    <div className="h-2 w-3/4 bg-slate-700 rounded-full" />
                    <div className="h-2 w-1/2 bg-slate-700 rounded-full" />
                    <div className="h-2 w-5/6 bg-slate-700 rounded-full" />
                 </div>
                 <div className="absolute bottom-4 right-4 px-4 py-2 bg-emerald-500/20 text-emerald-400 rounded-lg text-xs font-bold border border-emerald-500/30">
                    MATCH: 98%
                 </div>
              </div>
            </div>
          </motion.div>

          {/* Card 2: ATS Optimization */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="bg-slate-900/50 border border-white/10 rounded-[32px] p-8 flex flex-col justify-between group hover:bg-slate-800/50 transition-colors"
          >
            <div>
              <Search className="w-10 h-10 text-indigo-400 mb-6" />
              <h3 className="text-xl font-bold text-white mb-2">ATS-Proof Logic</h3>
              <p className="text-slate-400 text-sm">Reverse-engineered keywords to pass automated filters.</p>
            </div>
            <div className="flex gap-2 mt-4">
              <span className="px-3 py-1 bg-white/10 rounded-full text-xs text-white">Parse</span>
              <span className="px-3 py-1 bg-white/10 rounded-full text-xs text-white">Match</span>
              <span className="px-3 py-1 bg-white/10 rounded-full text-xs text-white">Rank</span>
            </div>
          </motion.div>

          {/* Card 3: Instant Speed */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="bg-slate-900/50 border border-white/10 rounded-[32px] p-8 flex flex-col justify-between group hover:bg-slate-800/50 transition-colors"
          >
            <div>
              <Zap className="w-10 h-10 text-amber-400 mb-6" />
              <h3 className="text-xl font-bold text-white mb-2">Sub-Second Audits</h3>
              <p className="text-slate-400 text-sm">Get actionable feedback faster than a recruiter can open your PDF.</p>
            </div>
             <div className="w-full bg-slate-800 rounded-full h-1 mt-4 overflow-hidden">
                <motion.div 
                    initial={{ width: 0 }}
                    whileInView={{ width: "100%" }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="h-full bg-amber-400"
                />
             </div>
          </motion.div>

          {/* Card 4: Wide Card - Score History */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="md:col-span-2 bg-slate-900/50 border border-white/10 rounded-[32px] p-8 flex items-center justify-between group overflow-hidden"
          >
             <div className="max-w-xs relative z-10">
                <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center mb-4 text-emerald-400">
                    <TrendingUp className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Track Your Growth</h3>
                <p className="text-slate-400 text-sm">Watch your score improve as you apply our suggestions. We store every version.</p>
             </div>
             {/* Graph Visual */}
             <div className="h-full w-1/2 flex items-end justify-center gap-2 opacity-50 group-hover:opacity-80 transition-opacity">
                <div className="h-10 w-4 bg-slate-700 rounded-t-sm" />
                <div className="h-16 w-4 bg-slate-700 rounded-t-sm" />
                <div className="h-12 w-4 bg-slate-700 rounded-t-sm" />
                <div className="h-24 w-4 bg-emerald-500 rounded-t-sm" />
             </div>
          </motion.div>

          {/* Card 5: Privacy */}
           <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="bg-slate-900/50 border border-white/10 rounded-[32px] p-8 flex flex-col justify-center items-center text-center group hover:bg-slate-800/50 transition-colors"
          >
            <ShieldCheck className="w-12 h-12 text-slate-600 group-hover:text-emerald-400 transition-colors mb-4" />
            <h3 className="text-lg font-bold text-white">100% Private</h3>
            <p className="text-slate-500 text-xs mt-2">Your data never leaves our secure encryption.</p>
          </motion.div>

        </div>
      </div>
    </section>
  );
};
