"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Check, Star } from 'lucide-react';
import Link from 'next/link';
import { CheckoutButton } from '@/components/features/billing/CheckoutButton';
import { useUser } from '@clerk/nextjs';

const PRICING_PLANS = [
  {
    name: "Starter",
    price: "$0",
    description: "Perfect for your first audit.",
    features: ["10 AI Audits / Day", "Basic ATS Scoring", "Standard Support"],
    popular: false,
    href: "/app"
  },
  {
    name: "Pro",
    price: "$19",
    description: "Dominate the application pile.",
    features: ["Unlimited Audits", "Deep 'Hiring Manager' Insights", "PDF & Docx Export", "Priority Support", "Version History"],
    popular: true,
    href: "/checkout"
  }
];

export const PricingSection = () => {
  const { isSignedIn } = useUser();

  return (
    <section id="pricing" className="py-32 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-24 max-w-2xl mx-auto"
        >
          <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-white mb-6">
            Unlock Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-400">Potential</span>
          </h2>
          <p className="text-lg text-slate-400">
            Stop losing opportunities to poor formatting. Get the competitive edge you need to stand out.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {PRICING_PLANS.map((plan, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
              whileHover={{ y: -10, rotateX: 2, scale: 1.02 }}
              className={`relative p-1 rounded-[32px] overflow-hidden group transition-all duration-500
                ${plan.popular ? 'bg-gradient-to-b from-violet-500 via-indigo-500 to-violet-500 shadow-2xl shadow-violet-500/20' : 'bg-slate-800/50'}`}
            >
              
              <div className={`h-full bg-slate-950 rounded-[30px] p-8 md:p-10 relative overflow-hidden
                 ${plan.popular ? 'bg-slate-900/90' : 'bg-slate-950'}`}
              >
                {/* Background Noise/Effect */}
                <div className="absolute inset-0 bg-noise opacity-[0.03] pointer-events-none" />
                
                {plan.popular && (
                  <div className="absolute top-6 right-6">
                    <span className="flex items-center gap-1 px-3 py-1 bg-violet-500/20 text-violet-300 text-[10px] font-black uppercase tracking-widest rounded-full border border-violet-500/30 shadow-[0_0_15px_rgba(139,92,246,0.5)]">
                      <Star className="w-3 h-3 fill-current" /> Popular
                    </span>
                  </div>
                )}

                <div className="mb-8">
                  <h3 className="text-lg font-bold text-white uppercase tracking-widest mb-4 opacity-80">{plan.name}</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-black text-white tracking-tighter">{plan.price}</span>
                    <span className="text-slate-500 font-medium">/mo</span>
                  </div>
                  <p className="text-slate-400 text-sm mt-4 font-medium">{plan.description}</p>
                </div>

                <ul className="space-y-4 mb-10">
                  {plan.features.map((feat, j) => (
                    <li key={j} className="flex items-start gap-3 text-sm text-slate-300">
                      <div className="mt-0.5 p-0.5 rounded-full bg-emerald-500/20 text-emerald-400">
                         <Check className="w-3 h-3" />
                      </div>
                      {feat}
                    </li>
                  ))}
                </ul>

                {plan.popular ? (
                   <CheckoutButton />
                ) : (
                  <Link 
                    href={plan.href}
                    className="flex items-center justify-center w-full py-4 rounded-xl font-black uppercase tracking-widest text-xs transition-all bg-white/5 hover:bg-white/10 text-white border border-white/10 hover:border-white/20"
                  >
                    Get Started
                  </Link>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Comparison Table */}
        <div className="mt-24 max-w-4xl mx-auto relative group">
          
          {/* Decorative Glow */}
          <div className="absolute -inset-1 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-[2rem] blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200" />
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative rounded-[2rem] bg-slate-950 border border-slate-800 overflow-hidden shadow-2xl"
          >
             {/* Header */}
             <div className="grid grid-cols-3 p-8 bg-slate-900/50 backdrop-blur-xl border-b border-white/5">
                <div className="flex items-center text-sm font-bold text-slate-400 uppercase tracking-widest">Core Features</div>
                <div className="text-center">
                    <span className="text-sm font-bold text-slate-200 uppercase tracking-widest">Starter</span>
                </div>
                <div className="text-center relative">
                    <span className="text-sm font-black text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-400 uppercase tracking-widest">Pro Plan</span>
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-full h-1 bg-gradient-to-r from-violet-500 to-indigo-500 blur-[20px] opacity-30" />
                </div>
             </div>
             
             {/* Rows */}
             <div className="divide-y divide-white/5 relative">
                {/* Vertical Highlight for Pro Column */}
                <div className="absolute top-0 bottom-0 right-0 w-1/3 bg-violet-500/[0.03] border-l border-white/5 pointer-events-none" />

                {[
                  { name: "Daily Audits", free: "10 Credits", pro: "Unlimited" },
                  { name: "ATS Scoring Engine", free: "Basic Analysis", pro: "Deep Hiring Manager Logic" },
                  { name: "Detailed Fixes", free: false, pro: true },
                  { name: "PDF & Docx Export", free: false, pro: true },
                  { name: "Version History", free: false, pro: true },
                  { name: "Priority Support", free: false, pro: true },
                ].map((item, i) => (
                  <div key={i} className="grid grid-cols-3 p-6 text-sm hover:bg-white/[0.02] transition-colors relative z-10 group/row">
                     <div className="flex items-center text-slate-300 font-medium group-hover/row:text-white transition-colors">{item.name}</div>
                     
                     {/* Free Values */}
                     <div className="flex items-center justify-center text-slate-500 font-medium">
                        {typeof item.free === 'boolean' ? (
                          item.free ? <Check className="w-5 h-5 text-emerald-500" /> : <div className="w-2 h-2 rounded-full bg-slate-800" />
                        ) : (
                          item.free
                        )}
                     </div>
                     
                     {/* Pro Values */}
                     <div className="flex items-center justify-center text-white font-bold">
                        {typeof item.pro === 'boolean' ? (
                          item.pro ? (
                            <div className="p-1 rounded-full bg-emerald-500/10 text-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.3)]">
                                <Check className="w-4 h-4" />
                            </div>
                          ) : <div className="w-2 h-2 rounded-full bg-slate-800" />
                        ) : (
                          <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-200 to-indigo-200">{item.pro}</span>
                        )}
                     </div>
                  </div>
                ))}
             </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
