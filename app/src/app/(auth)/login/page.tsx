"use client";

import { useState } from "react";
import Link from "next/link";
import { Terminal, Github, Zap, Shield, Clock, Loader2 } from "lucide-react";
import { signInWithGitHub, signInWithGoogle } from "@/lib/auth/supabase-auth";

export default function LoginPage() {
  const [isLoadingGitHub, setIsLoadingGitHub] = useState(false);
  const [isLoadingGoogle, setIsLoadingGoogle] = useState(false);

  const handleGitHub = async () => {
    setIsLoadingGitHub(true);
    const { error } = await signInWithGitHub();
    if (error) {
      alert("GitHub sign-in failed. Please try again.");
      setIsLoadingGitHub(false);
    }
    // On success, signInWithGitHub redirects — no need to setLoading(false)
  };

  const handleGoogle = async () => {
    setIsLoadingGoogle(true);
    const { error } = await signInWithGoogle();
    if (error) {
      alert("Google sign-in failed. Please try again.");
      setIsLoadingGoogle(false);
    }
  };

  const features = [
    { icon: Zap, text: "Provision in under 5 minutes" },
    { icon: Shield, text: "Infrastructure errors shown live — never black-boxed" },
    { icon: Clock, text: "Save 2–8 hours per project" },
  ];

  return (
    <div className="flex min-h-screen bg-[#0a0a0f]">
      {/* Left Side - Branding */}
      <div className="hidden w-1/2 lg:flex lg:flex-col lg:justify-between relative overflow-hidden p-10 border-r border-white/5 bg-gradient-to-b from-slate-950 to-slate-900">
        <div className="absolute top-0 left-0 w-96 h-96 bg-[#00f5ff]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#FFD700]/5 rounded-full blur-3xl" />

        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#00f5ff] to-[#FFD700]">
              <Terminal className="h-5 w-5 text-slate-950" />
            </div>
            <h1 className="text-xl font-bold text-white font-['Syne']">ShipMe</h1>
          </Link>
        </div>

        <div className="relative z-10">
          <h2 className="mb-4 text-4xl font-bold leading-tight text-white font-['Syne']">
            From idea to<br />
            <span className="bg-gradient-to-r from-[#00f5ff] to-[#FFD700] bg-clip-text text-transparent">
              live app in minutes
            </span>
          </h2>
          <p className="text-lg text-slate-400 mb-8 max-w-md">
            Connect GitHub, Supabase, and Netlify — ShipMe provisions everything automatically.
          </p>

          <div className="space-y-4">
            {features.map((feature, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#00f5ff]/10 border border-[#00f5ff]/20 flex items-center justify-center flex-shrink-0">
                  <feature.icon className="h-4 w-4 text-[#00f5ff]" />
                </div>
                <span className="text-slate-300 text-sm">{feature.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10">
          <div className="rounded-xl p-4 border border-white/10 bg-white/5">
            <p className="text-sm text-slate-400 italic">
              &quot;ShipMe saved me hours on my last project. The infrastructure was production-ready from minute one.&quot;
            </p>
            <p className="text-sm text-[#00f5ff] mt-2 font-medium">— Indie Developer</p>
          </div>
        </div>
      </div>

      {/* Right Side - Login */}
      <div className="flex w-full flex-col justify-center bg-[#0a0a0f] px-6 lg:w-1/2 lg:px-12">
        <div className="mx-auto w-full max-w-md">
          {/* Mobile Logo */}
          <div className="mb-10 lg:hidden">
            <Link href="/" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#00f5ff] to-[#FFD700]">
                <Terminal className="h-5 w-5 text-slate-950" />
              </div>
              <span className="text-xl font-bold text-white font-['Syne']">ShipMe</span>
            </Link>
          </div>

          <h2 className="mb-2 text-3xl font-bold text-white font-['Syne']">Sign in</h2>
          <p className="mb-8 text-slate-400">
            Connect your accounts and start shipping
          </p>

          <div className="space-y-3">
            {/* GitHub — primary, needed for repo creation */}
            <button
              onClick={handleGitHub}
              disabled={isLoadingGitHub || isLoadingGoogle}
              className="flex w-full items-center justify-center gap-3 rounded-xl border-2 border-white/10 bg-white/5 px-5 py-3.5 font-semibold text-slate-200 transition-all hover:border-[#00f5ff]/40 hover:bg-white/10 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoadingGitHub ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Github className="h-5 w-5" />
              )}
              Continue with GitHub
            </button>

            {/* Google */}
            <button
              onClick={handleGoogle}
              disabled={isLoadingGitHub || isLoadingGoogle}
              className="flex w-full items-center justify-center gap-3 rounded-xl border-2 border-white/10 bg-white/5 px-5 py-3.5 font-semibold text-slate-200 transition-all hover:border-white/20 hover:bg-white/10 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoadingGoogle ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              )}
              Continue with Google
            </button>
          </div>

          <p className="mt-6 text-xs text-slate-500 text-center">
            GitHub is required to create repositories. If you sign in with Google,
            you&apos;ll connect GitHub separately before shipping.
          </p>

          <div className="mt-8 text-center">
            <Link href="/" className="text-sm text-slate-500 hover:text-slate-300 transition-colors">
              ← Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
