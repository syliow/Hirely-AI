"use client";

import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useUser, useClerk } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

export const CheckoutButton = () => {
  const { user } = useUser();
  const { openSignIn } = useClerk();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    if (!user) {
      openSignIn();
      return;
    }

    // Check if user is already Pro (requires webhook to update metadata)
    if (user.publicMetadata?.isPro) {
      router.push('/dashboard');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Checkout failed");
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error("No checkout URL returned");
      }
    } catch (error) {
      console.error("Checkout Failed:", error);
      // Optional: Add toast notification here
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handleCheckout}
      disabled={loading}
      className="flex items-center justify-center w-full py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all bg-white text-violet-600 hover:bg-white/90 shadow-lg hover:scale-105 active:scale-95 disabled:opacity-70 disabled:pointer-events-none"
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Upgrade to Pro"}
    </button>
  );
};
