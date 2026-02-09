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
      </div>
    </section>
  );
};
