"use client";

import React from 'react';
import Link from 'next/link';
import { BrandLogo } from '@/components/BrandLogo';
import { PlayCircle, Sun, Moon, LayoutDashboard } from 'lucide-react';
import { SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface HeaderProps {
  onReset?: () => void;
  onStartTour?: () => void;
  onToggleTheme: () => void;
  isDarkMode: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onReset, onStartTour, onToggleTheme, isDarkMode }) => {
  return (
    <motion.header 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="h-16 md:h-20 border-b border-border/40 flex items-center px-4 md:px-10 lg:px-20 justify-between sticky top-0 bg-background/80 backdrop-blur-2xl z-50 supports-[backdrop-filter]:bg-background/60"
    >
      <div className="flex items-center gap-2 md:gap-8">
        <Link href="/" onClick={onReset} id="header-brand" className="flex items-center gap-3 group">
          <BrandLogo size={32} className="w-8 h-8 md:w-10 md:h-10" />
          <span className="hidden md:block text-xl md:text-2xl font-black tracking-tighter text-foreground uppercase">
            HIRELY<span className="text-primary text-gradient">.AI</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground ml-4">
          <Link href="/pricing" className="hover:text-foreground transition-colors">Pricing</Link>
          <Link href="/features" className="hover:text-foreground transition-colors">Features</Link>
        </nav>
      </div>
      
      <div className="flex items-center gap-4">
        {/* Tour Button */}
        {onStartTour && (
          <button 
            onClick={onStartTour} 
            className="flex items-center gap-2 px-3 py-2 text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors bg-white/5 hover:bg-white/10 border border-transparent hover:border-white/10 rounded-full backdrop-blur-md"
          >
            <PlayCircle className="w-4 h-4" /> 
            <span className="hidden sm:inline">Tour</span>
          </button>
        )}

        {/* Theme Toggle */}
        <button 
          onClick={onToggleTheme} 
          className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-white/10"
        >
          {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        <div className="w-px h-6 bg-border/50 mx-1 hidden sm:block" />

        {/* Auth / Dashboard */}
        <SignedIn>
          <Link 
            href="/dashboard" 
            className="hidden md:flex items-center gap-2 px-4 py-2 text-sm font-bold text-primary hover:text-primary/80 transition-colors bg-primary/10 hover:bg-primary/20 rounded-full backdrop-blur-sm"
          >
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </Link>
          <UserButton 
            afterSignOutUrl="/" 
            appearance={{
              elements: {
                avatarBox: "w-9 h-9 border-2 border-primary/20 ring-2 ring-primary/10"
              }
            }}
          />
        </SignedIn>

        <SignedOut>
          <SignInButton mode="modal">
            <button className="px-5 py-2 text-sm font-bold text-white bg-primary hover:bg-primary/90 rounded-full transition-all shadow-lg hover:shadow-primary/25">
              Sign In
            </button>
          </SignInButton>
        </SignedOut>
      </div>
    </motion.header>
  );
};
