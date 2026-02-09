"use client";

import React, { useEffect, useState } from 'react';
import { useUser, useClerk } from '@clerk/nextjs';
import { supabase } from '@/lib/supabase';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/Footer';
import { motion } from 'framer-motion';
import { FileText, Calendar, ChevronRight, TrendingUp } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const [audits, setAudits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(true);

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
        // middleware handles redirect, but just in case
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 bg-primary/20 rounded-full mb-4"></div>
          <div className="h-4 w-32 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-primary/30">
        <Header 
        onReset={() => {}} 
        onStartTour={() => {}} 
        onToggleTheme={() => setIsDarkMode(!isDarkMode)} 
        isDarkMode={isDarkMode} 
      />

      <main className="flex-1 max-w-6xl mx-auto w-full p-4 md:p-10 space-y-8">
        
        {/* Welcome Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <h1 className="text-3xl md:text-4xl font-black text-foreground">
            Welcome back, <span className="text-primary">{user?.firstName || 'User'}</span>
          </h1>
          <p className="text-muted-foreground text-lg">
            Track your resume improvements and job application progress.
          </p>
        </motion.div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6 rounded-2xl">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Audits</h3>
            <p className="text-4xl font-black text-foreground mt-2">{audits.length}</p>
          </motion.div>
          
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-6 rounded-2xl">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Avg. Score</h3>
            <p className="text-4xl font-black text-primary mt-2">
              {audits.length > 0 
                ? Math.round(audits.reduce((acc, curr) => acc + (curr.score || 0), 0) / audits.length) 
                : 0}
            </p>
          </motion.div>

           <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card p-6 rounded-2xl border-primary/20 bg-primary/5">
            <h3 className="text-sm font-medium text-primary uppercase tracking-wider flex items-center gap-2">
               <TrendingUp className="w-4 h-4" /> Pro Status
            </h3>
            <p className="text-lg font-bold text-foreground mt-2">Free Plan</p>
            <button className="text-xs font-bold text-primary mt-2 hover:underline">Upgrade for Unlimited</button>
          </motion.div>
        </div>

        {/* Recent Audits List */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="space-y-4">
          <h2 className="text-xl font-bold text-foreground">Recent Audits</h2>
          
          {audits.length === 0 ? (
            <div className="text-center py-20 border-2 border-dashed border-border rounded-3xl">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-bold text-foreground">No audits yet</h3>
              <p className="text-muted-foreground mb-6">Upload your first resume to get started.</p>
              <button onClick={() => router.push('/')} className="px-6 py-3 bg-primary text-white font-bold rounded-full hover:bg-primary/90 transition-all">
                Create New Audit
              </button>
            </div>
          ) : (
            <div className="grid gap-4">
              {audits.map((audit) => (
                <div key={audit.id} className="glass-card p-6 rounded-2xl flex items-center justify-between group hover:border-primary/50 transition-colors cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                      {audit.score || 0}
                    </div>
                    <div>
                      <h4 className="font-bold text-foreground">{audit.file_name}</h4>
                      <p className="text-sm text-muted-foreground flex items-center gap-2">
                        <Calendar className="w-3 h-3" /> {new Date(audit.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              ))}
            </div>
          )}
        </motion.div>

      </main>

      <Footer />
    </div>
  );
}
