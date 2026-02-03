"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, Lock, Loader2, Eye, EyeOff, User, Terminal, Github, CheckCircle2 } from "lucide-react";

export default function SignupPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // TODO: Implement Supabase auth
    setTimeout(() => setIsLoading(false), 1000);
  };

  const handleOAuthSignup = (provider: string) => {
    // TODO: Implement OAuth
    console.log(`OAuth signup with ${provider}`);
  };

  const benefits = [
    "2 free provisions per month",
    "3 starter templates included",
    "Open source CLI access",
    "No credit card required",
  ];

  return (
    <div className="flex min-h-screen bg-[#0a0a0f]">
      {/* Background Grid */}
      <div className="bg-grid fixed inset-0 opacity-30" />

      {/* Left Side - Branding */}
      <div className="hidden w-1/2 lg:flex lg:flex-col lg:justify-between relative overflow-hidden p-10 border-r border-white/5">
        {/* Animated Background Spotlights */}
        <div className="spotlight top-0 left-0 animate-float" />
        <div className="spotlight bottom-0 right-0 animate-float" style={{ animationDelay: '3s' }} />

        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-[#00f5ff] to-[#d4ff00] blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
              <div className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#00f5ff] to-[#d4ff00]">
                <Terminal className="h-5 w-5 text-[#0a0a0f]" />
              </div>
            </div>
            <h1 className="text-xl font-bold text-white font-['Syne']">
              ShipMe
            </h1>
          </Link>
        </div>

        <div className="relative z-10">
          <h2 className="mb-4 text-4xl font-bold leading-tight text-white font-['Syne']">
            Start building with
            <br />
            <span className="gradient-text-cyan-lime">ShipMe</span>
          </h2>
          <p className="text-lg text-slate-400 mb-8 max-w-md">
            Provision production-ready infrastructure in under 3 minutes. No more manual setup.
          </p>

          <div className="space-y-3">
            {benefits.map((benefit, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-[#d4ff00]/20 border border-[#d4ff00]/30 flex items-center justify-center">
                  <CheckCircle2 className="h-3 w-3 text-[#d4ff00]" />
                </div>
                <span className="text-slate-300 text-sm">{benefit}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10">
          <div className="terminal-cyber rounded-xl p-4">
            <div className="font-['Fira_Code'] text-sm space-y-1">
              <div><span className="text-[#00f5ff]">→</span> <span className="text-slate-300">shipme provision my-saas</span></div>
              <div className="text-slate-500">⚡ Provisioning infrastructure...</div>
              <div className="text-[#d4ff00]">✓ Complete in 2m 47s</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Signup Form */}
      <div className="flex w-full flex-col justify-center bg-[#0a0a0f] px-6 lg:w-1/2 lg:px-12 relative z-10">
        <div className="mx-auto w-full max-w-md">
          {/* Mobile Logo */}
          <div className="mb-10 lg:hidden">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-[#00f5ff] to-[#d4ff00] blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
                <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#00f5ff] to-[#d4ff00]">
                  <Terminal className="h-5 w-5 text-[#0a0a0f]" />
                </div>
              </div>
              <span className="text-xl font-bold text-white font-['Syne']">
                ShipMe
              </span>
            </Link>
          </div>

          <div>
            <h2 className="mb-2 text-3xl font-bold text-white font-['Syne']">
              Create your account
            </h2>
            <p className="mb-8 text-slate-400">
              Get started with 2 free provisions per month
            </p>

            {/* OAuth Buttons */}
            <div className="mb-6 space-y-3">
              <button
                onClick={() => handleOAuthSignup("github")}
                className="flex w-full items-center justify-center gap-3 rounded-xl border-2 border-white/10 bg-white/5 px-5 py-3 font-semibold text-slate-200 transition-all hover:border-[#00f5ff]/30 hover:bg-white/10"
              >
                <Github className="h-5 w-5" />
                Continue with GitHub
              </button>
              <button
                onClick={() => handleOAuthSignup("google")}
                className="flex w-full items-center justify-center gap-3 rounded-xl border-2 border-white/10 bg-white/5 px-5 py-3 font-semibold text-slate-200 transition-all hover:border-[#00f5ff]/30 hover:bg-white/10"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </button>
            </div>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-[#0a0a0f] px-4 font-medium text-slate-500">
                  Or sign up with email
                </span>
              </div>
            </div>

            {/* Email/Password Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-300">
                  Full name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full rounded-xl border-2 border-white/10 bg-white/5 py-3 pl-10 pr-4 text-slate-100 placeholder-slate-500 transition-all focus:border-[#00f5ff]/50 focus:outline-none focus:ring-4 focus:ring-[#00f5ff]/10"
                    placeholder="Your name"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-300">
                  Email address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border-2 border-white/10 bg-white/5 py-3 pl-10 pr-4 text-slate-100 placeholder-slate-500 transition-all focus:border-[#00f5ff]/50 focus:outline-none focus:ring-4 focus:ring-[#00f5ff]/10"
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-300">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border-2 border-white/10 bg-white/5 py-3 pl-10 pr-11 text-slate-100 placeholder-slate-500 transition-all focus:border-[#00f5ff]/50 focus:outline-none focus:ring-4 focus:ring-[#00f5ff]/10"
                    placeholder="Create a password"
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-[#00f5ff] transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <p className="mt-1.5 text-xs text-slate-500">Must be at least 8 characters</p>
              </div>

              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="mt-1 h-4 w-4 rounded border-white/20 bg-white/5 text-[#00f5ff] focus:ring-2 focus:ring-[#00f5ff]/50"
                  required
                />
                <span className="text-sm text-slate-400">
                  I agree to the{" "}
                  <Link href="/terms" className="font-medium text-[#00f5ff] hover:text-[#d4ff00] transition-colors">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy" className="font-medium text-[#00f5ff] hover:text-[#d4ff00] transition-colors">
                    Privacy Policy
                  </Link>
                </span>
              </label>

              <button
                type="submit"
                disabled={isLoading}
                className="btn-cyber flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-base font-bold disabled:cursor-not-allowed disabled:opacity-60 mt-6"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  "Create account"
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-slate-400">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="font-semibold text-[#00f5ff] hover:text-[#d4ff00] transition-colors"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
