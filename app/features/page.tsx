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
  Cpu, 
  Eye, 
  BarChart,
  ArrowRight
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/Footer';

export default function FeaturesPage() {
  const [isDarkMode, setIsDarkMode] = React.useState(true);

  React.useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  const features = [
    {
      title: "AI Hiring Manager Persona",
      description: "Our AI simulates a 10-year veteran recruiter. It doesn't just check grammar; it critiques your impact, tone, and strategic positioning.",
      icon: <Bot className="w-8 h-8 text-white" />,
      color: "violet"
    },
    {
      title: "ATS Reverse-Engineering",
      description: "We use the same logic as Applicant Tracking Systems to parse your resume. Identify exact keywords missing from job descriptions.",
      icon: <Search className="w-8 h-8 text-indigo-400" />,
      color: "indigo"
    },
    {
      title: "Real-Time Scoring",
      description: "Get an instant ATS Score (0-100) based on readability, keyword density, and formatting. Watch it rise as you fix issues.",
      icon: <BarChart className="w-8 h-8 text-emerald-400" />,
      color: "emerald"
    },
    {
      title: "Content Strategy",
      description: "Not just 'what' to say, but 'how'. We suggest stronger action verbs, quantifiable metrics, and results-oriented phrasing.",
      icon: <FileText className="w-8 h-8 text-blue-400" />,
      color: "blue"
    },
    {
      title: "Privacy First",
      description: "Your data is encrypted and never sold. We delete your resumes from our servers unless you choose to save them.",
      icon: <ShieldCheck className="w-8 h-8 text-slate-300" />,
      color: "slate"
    },
    {
      title: "PDF & Docx Export",
      description: "Download your improved resume in perfect formatting. No more messy layout shifts.",
      icon: <Zap className="w-8 h-8 text-amber-400" />,
      color: "amber"
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#020617] text-slate-200 font-sans selection:bg-violet-500/30">
      <Header 
        onReset={() => {}} 
        onStartTour={() => {}} 
        onToggleTheme={() => setIsDarkMode(!isDarkMode)} 
        isDarkMode={isDarkMode} 
      />

      <main className="flex-1 w-full relative z-10 pt-24 pb-32">
        {/* Hero */}
        <div className="text-center px-6 mb-32 relative">
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-600/10 rounded-full blur-[120px] pointer-events-none" />
             
             <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-5xl md:text-7xl font-black tracking-tighter text-white mb-8 relative z-10"
             >
                Built for <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-400">Impact.</span>
             </motion.h1>
             <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-xl text-slate-400 max-w-2xl mx-auto relative z-10"
             >
                Explore the technology behind the world's most advanced resume auditor.
             </motion.p>
        </div>

        {/* Unique Feature Layout */}
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-[300px]">
            
            {/* Feature 1: Large Featured */}
            <motion.div 
               initial={{ opacity: 0, scale: 0.95 }}
               whileInView={{ opacity: 1, scale: 1 }}
               viewport={{ once: true }}
               className="md:col-span-8 bg-gradient-to-br from-violet-900/40 to-slate-900 border border-white/5 rounded-[40px] p-10 relative overflow-hidden group"
            >
                <div className="relative z-10 max-w-md">
                    <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-md">
                        <Bot className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-3xl font-black text-white mb-4">AI Hiring Manager</h3>
                    <p className="text-lg text-slate-300 leading-relaxed">
                        We don't just "check grammar". Our AI simulates a 10-year veteran recruiter, ruthlessly critiquing your impact, tone, and strategic positioning.
                    </p>
                </div>
                <div className="absolute right-0 bottom-0 w-1/2 h-full opacity-30 pointer-events-none">
                    <div className="absolute inset-0 bg-gradient-to-l from-transparent to-slate-900 z-10" />
                    <div className="w-full h-full bg-[url('https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&q=80')] bg-cover bg-center grayscale mix-blend-overlay" />
                </div>
            </motion.div>

            {/* Feature 2: Stats/Clean */}
            <motion.div 
               initial={{ opacity: 0, scale: 0.95 }}
               whileInView={{ opacity: 1, scale: 1 }}
               viewport={{ once: true }}
               transition={{ delay: 0.1 }}
               className="md:col-span-4 bg-slate-900/50 border border-white/5 rounded-[40px] p-8 flex flex-col justify-between group hover:bg-slate-800/50 transition-colors"
            >
                <div>
                    <Search className="w-10 h-10 text-indigo-400 mb-6" />
                    <h3 className="text-2xl font-bold text-white mb-2">ATS Reverse-Engineering</h3>
                    <p className="text-slate-400">We use the same parsing logic as the Fortune 500.</p>
                </div>
                <div className="flex gap-2">
                    <span className="px-3 py-1 bg-white/5 border border-white/5 rounded-full text-xs text-indigo-200">Parse</span>
                    <span className="px-3 py-1 bg-white/5 border border-white/5 rounded-full text-xs text-indigo-200">Match</span>
                </div>
            </motion.div>

            {/* Feature 3: Tall Vertical */}
            <motion.div 
               initial={{ opacity: 0, scale: 0.95 }}
               whileInView={{ opacity: 1, scale: 1 }}
               viewport={{ once: true }}
               transition={{ delay: 0.2 }}
               className="md:col-span-4 md:row-span-2 bg-gradient-to-b from-emerald-900/20 to-slate-900 border border-white/5 rounded-[40px] p-8 relative overflow-hidden group"
            >
                <div className="absolute top-0 right-0 p-32 bg-emerald-500/10 blur-[80px] rounded-full pointer-events-none" />
                <div className="relative z-10 h-full flex flex-col">
                    <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center mb-6 text-emerald-400">
                        <BarChart className="w-6 h-6" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-4">Real-Time Scoring</h3>
                    <p className="text-slate-400 mb-8">Watch your score rise as you fix issues in real-time.</p>
                    
                    <div className="mt-auto relative w-full h-48 bg-slate-950/50 rounded-2xl border border-white/5 overflow-hidden flex items-end justify-center p-4 gap-2">
                        <motion.div initial={{ height: "20%" }} whileInView={{ height: "40%" }} transition={{ duration: 1 }} className="w-8 bg-emerald-900/50 rounded-t-lg" />
                        <motion.div initial={{ height: "20%" }} whileInView={{ height: "65%" }} transition={{ duration: 1, delay: 0.2 }} className="w-8 bg-emerald-700/50 rounded-t-lg" />
                        <motion.div initial={{ height: "20%" }} whileInView={{ height: "90%" }} transition={{ duration: 1, delay: 0.4 }} className="w-8 bg-emerald-500 rounded-t-lg shadow-[0_0_15px_rgba(16,185,129,0.4)]" />
                    </div>
                </div>
            </motion.div>

            {/* Feature 4: Privacy */}
            <motion.div 
               initial={{ opacity: 0, scale: 0.95 }}
               whileInView={{ opacity: 1, scale: 1 }}
               viewport={{ once: true }}
               transition={{ delay: 0.3 }}
               className="md:col-span-4 bg-slate-900/50 border border-white/5 rounded-[40px] p-8 flex flex-col justify-center items-center text-center group hover:bg-slate-800/50 transition-colors"
            >
                 <ShieldCheck className="w-12 h-12 text-slate-600 group-hover:text-white transition-colors mb-4" />
                 <h3 className="text-xl font-bold text-white">Encrypted & Private</h3>
            </motion.div>

            {/* Feature 5: Export */}
            <motion.div 
               initial={{ opacity: 0, scale: 0.95 }}
               whileInView={{ opacity: 1, scale: 1 }}
               viewport={{ once: true }}
               transition={{ delay: 0.4 }}
               className="md:col-span-4 bg-slate-900/50 border border-white/5 rounded-[40px] p-8 flex flex-col justify-between group hover:bg-slate-800/50 transition-colors"
            >
                 <div>
                    <Zap className="w-10 h-10 text-amber-400 mb-6" />
                    <h3 className="text-xl font-bold text-white">Instant Export</h3>
                 </div>
                 <div className="flex justify-between items-center text-slate-500 text-sm">
                    <span>PDF & Docx</span>
                    <ArrowRight className="w-4 h-4" />
                 </div>
            </motion.div>

        </div>

        {/* Technical Deep Dive */}
        <div className="mt-40 max-w-7xl mx-auto px-6">
            <div className="rounded-[40px] bg-gradient-to-br from-slate-900 to-slate-950 border border-white/10 p-8 md:p-16 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-violet-500 to-transparent opacity-20" />
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
                    <div>
                        <h2 className="text-3xl md:text-5xl font-black text-white mb-6">How It Works</h2>
                        <ul className="space-y-8">
                            <li className="flex gap-4">
                                <div className="w-8 h-8 rounded-full bg-violet-500/20 flex items-center justify-center text-violet-400 font-bold text-sm">1</div>
                                <div>
                                    <h4 className="text-white font-bold text-lg">Parsing</h4>
                                    <p className="text-slate-400">We extract raw text from PDF/Docx, ignoring formatting noise.</p>
                                </div>
                            </li>
                            <li className="flex gap-4">
                                <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold text-sm">2</div>
                                <div>
                                    <h4 className="text-white font-bold text-lg">Analysis</h4>
                                    <p className="text-slate-400">Our LLM compares your content against thousands of successful resumes.</p>
                                </div>
                            </li>
                            <li className="flex gap-4">
                                <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-sm">3</div>
                                <div>
                                    <h4 className="text-white font-bold text-lg">Optimization</h4>
                                    <p className="text-slate-400">We generate specific, actionable rewrites to boost your score.</p>
                                </div>
                            </li>
                        </ul>
                    </div>
                    
                    <div className="bg-slate-950 rounded-3xl border border-white/10 p-8 aspect-square relative">
                        {/* Mock Code Block */}
                        <div className="font-mono text-xs text-slate-500 space-y-2">
                            <div className="flex gap-2">
                                <span className="text-violet-400">const</span>
                                <span className="text-blue-300">analyzeResume</span>
                                <span className="text-white">=</span>
                                <span className="text-yellow-300">async</span>
                                <span className="text-white">(file)</span>
                                <span className="text-white">{`=> {`}</span>
                            </div>
                            <div className="pl-4 text-emerald-400">// Extracting skills & experience</div>
                            <div className="pl-4 flex gap-2">
                                <span className="text-violet-400">const</span>
                                <span className="text-white">skills</span>
                                <span className="text-white">=</span>
                                <span className="text-blue-300">await</span>
                                <span className="text-yellow-300">parser</span>
                                <span className="text-white">.extract(file);</span>
                            </div>
                            <div className="pl-4 text-emerald-400">// Calculating ATS match score</div>
                            <div className="pl-4 flex gap-2">
                                <span className="text-violet-400">return</span>
                                <span className="text-blue-300">calculateScore</span>
                                <span className="text-white">(skills, jobDesc);</span>
                            </div>
                            <div className="text-white">{`}`}</div>
                        </div>
                        
                        <div className="absolute bottom-8 right-8">
                            <Cpu className="w-24 h-24 text-violet-500/20 animate-pulse" />
                        </div>
                    </div>
                </div>
            </div>
        </div>

      </main>
      <Footer />
    </div>
  );
}
