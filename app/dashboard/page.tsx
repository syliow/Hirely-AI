"use client";

import React, { useEffect, useState, Suspense } from 'react';
import { useUser, useClerk } from '@clerk/nextjs';
import { supabase } from '@/lib/supabase';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/Footer';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Calendar, ChevronRight, TrendingUp, Clock, Plus, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

function DashboardContent() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [audits, setAudits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);

  // Calculate Avg Score
  const avgScore = audits.length > 0 
    ? Math.round(audits.reduce((acc, curr) => acc + (curr.score || 0), 0) / audits.length) 
    : 0;

  useEffect(() => {
    // Check for success param
    if (searchParams.get('success') === 'true') {
      setShowSuccess(true);
      // Clean up URL
      router.replace('/dashboard');
    }
  }, [searchParams, router]);

  useEffect(() => {
    async function fetchAudits() {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('audits')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setAudits(data || []);
      } catch (err) {
        console.error("Error fetching audits:", err);
      } finally {
        setLoading(false);
      }
    }

    if (isLoaded) {
      if (!user) {
        router.push('/');
      } else {
        fetchAudits();
      }
    }
  }, [user, isLoaded, router]);

  // Handle Theme
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);


  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#020617] flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-violet-500/20 rounded-full animate-bounce"></div>
          <p className="text-slate-500 dark:text-slate-400 font-medium uppercase tracking-widest text-sm">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#020617] transition-colors duration-300 selection:bg-violet-500/30 font-sans">
        <Header 
        onReset={() => {}} 
        onStartTour={() => {}} 
        onToggleTheme={() => setIsDarkMode(!isDarkMode)} 
        isDarkMode={isDarkMode} 
      />

      {/* Success Modal */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-8 bg-black/60 backdrop-blur-md"
            onClick={() => setShowSuccess(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white dark:bg-[#0f172a] p-12 rounded-[40px] shadow-2xl max-w-lg w-full text-center space-y-8 border border-white/20"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto text-emerald-500 mb-6">
                <CheckCircle2 className="w-12 h-12" />
              </div>
              <div>
                <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2">Welcome to Pro! 🚀</h2>
                <p className="text-slate-500 dark:text-slate-400 text-lg">Thank you for upgrading. You now have unlimited access to all premium features.</p>
              </div>
              <button onClick={() => setShowSuccess(false)} className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-black uppercase tracking-widest rounded-2xl transition-all shadow-xl shadow-emerald-500/20">
                Let's Go!
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-1 max-w-6xl mx-auto w-full p-6 md:p-12 space-y-12">
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full space-y-12"
        >
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <h1 className="text-3xl md:text-5xl font-black tracking-tighter text-slate-900 dark:text-white">
                Welcome back, <span className="text-violet-500">{user?.firstName || 'Candidate'}</span>
              </h1>
              <p className="text-slate-500 dark:text-slate-400 font-medium text-lg">Here's how your resume performance is trending.</p>
            </div>
            <Link href="/" className="px-8 py-4 bg-violet-600 hover:bg-violet-700 text-white font-black uppercase tracking-widest rounded-2xl transition-all shadow-xl shadow-violet-500/20 flex items-center gap-3 self-start md:self-auto hover:scale-105 active:scale-95">
               <Plus className="w-5 h-5" /> New Audit
            </Link>
          </header>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="p-8 rounded-[32px] bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-white/5 shadow-xl hover:shadow-2xl transition-all group">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-violet-100 dark:bg-violet-500/10 rounded-2xl text-violet-600 dark:text-violet-400 group-hover:scale-110 transition-transform">
                  <FileText className="w-6 h-6" />
                </div>
                <h3 className="font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 text-xs">Total Audits</h3>
              </div>
              <p className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white">{audits.length}</p>
            </motion.div>
            
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="p-8 rounded-[32px] bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-white/5 shadow-xl hover:shadow-2xl transition-all group">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-emerald-100 dark:bg-emerald-500/10 rounded-2xl text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <h3 className="font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 text-xs">Avg. Score</h3>
              </div>
              <p className={`text-4xl md:text-5xl font-black ${avgScore >= 80 ? 'text-emerald-500' : avgScore >= 50 ? 'text-yellow-500' : 'text-rose-500'}`}>{avgScore}</p>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="p-8 rounded-[32px] bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-2xl shadow-violet-500/30 relative overflow-hidden group cursor-pointer hover:scale-[1.02] transition-transform">
              <div className="absolute top-0 right-0 p-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none group-hover:bg-white/20 transition-colors" />
              <div className="relative z-10 space-y-4">
                 <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 rounded-2xl text-white backdrop-blur-sm">
                    <Clock className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold uppercase tracking-widest text-white/80 text-xs">Membership</h3>
                </div>
                <div>
                  <p className="text-2xl font-black mb-1">Free Plan</p>
                  <p className="text-white/70 text-sm font-medium">Upgrade for unlimited audits.</p>
                </div>
                <Link href="/pricing" className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-violet-600 font-black text-xs uppercase tracking-widest rounded-xl hover:bg-slate-100 transition-colors shadow-lg">
                  Go Pro <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
            </motion.div>
          </div>

          {/* Recent Audits */}
          <div className="space-y-8">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3">
               Recent Activity
            </h2>

            {audits.length === 0 ? (
              <div className="text-center py-24 border-4 border-dashed border-slate-200 dark:border-white/5 rounded-[48px] bg-slate-50 dark:bg-white/[0.02]">
                <FileText className="w-16 h-16 text-slate-300 dark:text-slate-700 mx-auto mb-6" />
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No audits found yet</h3>
                <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-md mx-auto">Upload your resume to get your first professional critique.</p>
                <Link href="/" className="px-10 py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black uppercase tracking-widest rounded-[24px] hover:scale-105 transition-transform shadow-xl">
                  Start Your First Scan
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {audits.map((audit) => (
                  <motion.div 
                    key={audit.id}
                    whileHover={{ y: -8 }}
                    className="group relative p-8 rounded-[32px] bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-white/5 shadow-xl hover:shadow-2xl hover:border-violet-500/30 transition-all flex flex-col justify-between h-full min-h-[280px]"
                  >
                    <div>
                      <div className="flex justify-between items-start mb-6">
                        <div className="p-3 bg-slate-100 dark:bg-white/5 rounded-2xl group-hover:bg-violet-500/10 group-hover:text-violet-500 transition-colors text-slate-400 dark:text-slate-500">
                          <FileText className="w-6 h-6" />
                        </div>
                        <span className={`text-2xl font-black ${audit.score >= 80 ? 'text-emerald-500' : audit.score >= 50 ? 'text-yellow-500' : 'text-rose-500'}`}>
                          {audit.score}
                        </span>
                      </div>
                      <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2 line-clamp-1" title={audit.file_name}>
                        {audit.file_name || 'Untitled Resume'}
                      </h3>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                        <Calendar className="w-3 h-3" /> {new Date(audit.created_at).toLocaleDateString()}
                      </p>
                      <p className="text-slate-500 dark:text-slate-400 text-sm line-clamp-3 mb-6 font-medium leading-relaxed">
                        {audit.summary || "No summary available for this audit."}
                      </p>
                    </div>
                    
                    <button className="w-full py-4 rounded-2xl border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 font-black uppercase text-xs tracking-widest hover:bg-slate-50 dark:hover:bg-white/5 hover:text-violet-500 hover:border-violet-500/30 transition-all">
                      View Report
                    </button>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>

      </main>

      <Footer />
    </div>
  );
}

export default function Dashboard() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 dark:bg-[#020617] flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-violet-500/20 rounded-full animate-bounce"></div>
          <p className="text-slate-500 dark:text-slate-400 font-medium uppercase tracking-widest text-sm">Loading Dashboard...</p>
        </div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}
