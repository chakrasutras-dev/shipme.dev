"use client";

import { useState, useEffect } from "react";
import { ArrowRight, Github, Zap, Shield, Terminal, Rocket, Sparkles } from "lucide-react";
import { signInWithGitHub, getSession } from "@/lib/auth/supabase-auth";

export default function LandingPage() {
  const [projectIdea, setProjectIdea] = useState("");
  const [repoName, setRepoName] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [recommendedStack, setRecommendedStack] = useState<any>(null);
  const [isLaunching, setIsLaunching] = useState(false);
  const [launchResult, setLaunchResult] = useState<any>(null);

  const handleAnalyzeIdea = async () => {
    if (!projectIdea.trim()) return;

    setIsAnalyzing(true);
    try {
      const response = await fetch("/api/analyze-idea", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea: projectIdea }),
      });

      if (response.ok) {
        const data = await response.json();
        setRecommendedStack(data);
      }
    } catch (error) {
      console.error("Analysis failed:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Check for pending launch after OAuth redirect
  useEffect(() => {
    const checkPendingLaunch = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const shouldLaunch = urlParams.get('launch') === 'pending';
      const hasError = urlParams.get('error');

      if (hasError) {
        alert(`Authentication failed: ${hasError}. Please try again.`);
        window.history.replaceState({}, '', '/');
        return;
      }

      if (!shouldLaunch) return;

      setIsLaunching(true);
      window.history.replaceState({}, '', '/');

      // Restore UI state that was saved before OAuth redirect
      const savedIdea = localStorage.getItem('pendingProjectIdea');
      const savedStack = localStorage.getItem('pendingRecommendedStack');
      if (savedIdea) {
        setProjectIdea(savedIdea);
        localStorage.removeItem('pendingProjectIdea');
      }
      if (savedStack) {
        try {
          setRecommendedStack(JSON.parse(savedStack));
        } catch {}
        localStorage.removeItem('pendingRecommendedStack');
      }

      // Read launch data from localStorage (stored before OAuth redirect)
      const stored = localStorage.getItem('pendingCodespaceLaunch');
      localStorage.removeItem('pendingCodespaceLaunch');

      if (!stored) {
        console.error('[Launch] No launch data in localStorage');
        alert('Launch data was lost. Please try again.');
        setIsLaunching(false);
        return;
      }

      let launchData;
      try {
        launchData = JSON.parse(stored);
        console.log('[Launch] Got launch data from localStorage:', launchData);
      } catch (e) {
        console.error('[Launch] Failed to parse launch data:', e);
        alert('Launch data was corrupted. Please try again.');
        setIsLaunching(false);
        return;
      }

      // Call the launch API - it checks auth server-side via cookies
      console.log('[Launch] Calling launch API directly...');
      await launchCodespace(launchData);
    };

    checkPendingLaunch();
  }, []);

  const triggerGitHubOAuth = async (launchData: any) => {
    // Store launch data + UI state before OAuth redirect
    localStorage.setItem('pendingCodespaceLaunch', JSON.stringify(launchData));
    localStorage.setItem('pendingProjectIdea', projectIdea);
    if (recommendedStack) {
      localStorage.setItem('pendingRecommendedStack', JSON.stringify(recommendedStack));
    }
    console.log('[Launch] Triggering GitHub OAuth...');
    const { error } = await signInWithGitHub();
    if (error) {
      console.error("GitHub auth failed:", error);
      alert("GitHub authentication failed. Please try again.");
      localStorage.removeItem('pendingCodespaceLaunch');
      localStorage.removeItem('pendingProjectIdea');
      localStorage.removeItem('pendingRecommendedStack');
      setIsLaunching(false);
    }
  };

  const launchCodespace = async (launchData: any) => {
    setIsLaunching(true);
    try {
      const response = await fetch("/api/launch-codespace", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(launchData),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setLaunchResult(result);
        // Open Codespace in new tab
        if (result.codespace_url) {
          window.open(result.codespace_url, '_blank');
        }
      } else if (response.status === 401) {
        // Auth or GitHub token missing — re-trigger GitHub OAuth
        console.log("[Launch] 401 received, re-triggering GitHub OAuth");
        await triggerGitHubOAuth(launchData);
        return; // Don't setIsLaunching(false) — OAuth redirect will navigate away
      } else {
        console.error("Launch failed:", result);
        alert(`Failed to launch: ${result.error || 'Unknown error'}`);
      }
    } catch (err) {
      console.error("Launch error:", err);
      alert("Failed to launch Codespace. Please try again.");
    } finally {
      setIsLaunching(false);
    }
  };

  const handleLaunchCodespace = async () => {
    setIsLaunching(true);

    try {
      const session = await getSession();

      const finalRepoName = repoName.trim()
        ? repoName.toLowerCase().replace(/[^a-z0-9-]/g, '-')
        : projectIdea.substring(0, 50).toLowerCase().replace(/[^a-z0-9]+/g, '-');

      const launchData = {
        projectName: finalRepoName,
        description: projectIdea,
        stack: recommendedStack?.recommendation?.stack || {}
      };

      if (session) {
        // Has Supabase session — try launching directly.
        // If GitHub token is missing, launchCodespace will auto-trigger OAuth.
        await launchCodespace(launchData);
      } else {
        // No session at all — trigger GitHub OAuth
        await triggerGitHubOAuth(launchData);
      }
    } catch (err) {
      console.error("Launch error:", err);
      alert("Failed to launch Codespace. Please try again.");
      setIsLaunching(false);
    }
  };

  // Show full-page launching state when auto-launching after OAuth redirect
  // (covers the case where recommendedStack wasn't restored from localStorage)
  if (isLaunching && !recommendedStack) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center max-w-lg mx-auto px-4">
          <div className="w-12 h-12 border-2 border-[#00f5ff] border-t-transparent rounded-full animate-spin mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-white mb-3 font-['Syne']">Launching Your Codespace</h2>
          <p className="text-slate-400">Setting up your development environment...</p>
          {launchResult && launchResult.codespace_url && (
            <a
              href={launchResult.codespace_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-6 px-6 py-3 bg-gradient-to-r from-[#00f5ff] to-[#FFD700] text-slate-950 rounded-lg font-semibold hover:shadow-xl transition-all"
            >
              <Terminal className="w-5 h-5" />
              Open Codespace
              <ArrowRight className="w-4 h-4" />
            </a>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Navigation */}
      <nav className="border-b border-white/5 backdrop-blur-sm fixed w-full top-0 z-50 bg-slate-950/80">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Rocket className="w-7 h-7 text-[#00f5ff]" />
              <span className="text-xl font-bold text-white font-['Syne']">ShipMe</span>
              <span className="text-xs bg-[#00f5ff]/10 text-[#00f5ff] px-2 py-1 rounded-full border border-[#00f5ff]/20">
                v2.0
              </span>
            </div>
            <div className="flex items-center gap-4">
              <a
                href="https://github.com/chakrasutras-dev/shipme.dev"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-[#00f5ff] transition-colors"
              >
                <Github className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          {/* Gradient Orb */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gradient-to-r from-[#00f5ff]/20 via-[#FFD700]/20 to-[#FF00FF]/20 rounded-full blur-3xl opacity-20 animate-pulse" />

          <div className="relative">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6">
              <Sparkles className="w-4 h-4 text-[#00f5ff]" />
              <span className="text-sm text-slate-300">Watch Claude Code provision your infrastructure</span>
            </div>

            <h1 className="text-5xl md:text-6xl font-bold mb-6 font-['Syne']">
              <span className="bg-gradient-to-r from-white via-slate-200 to-white bg-clip-text text-transparent">
                Infrastructure in
              </span>
              <br />
              <span className="bg-gradient-to-r from-[#00f5ff] via-[#FFD700] to-[#FF00FF] bg-clip-text text-transparent">
                5 Minutes, Not Hours
              </span>
            </h1>

            <p className="text-xl text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed">
              Describe your app. Launch a GitHub Codespace. Watch Claude Code automatically provision{" "}
              <span className="text-[#FFD700]">Supabase</span>, <span className="text-[#00f5ff]">Netlify</span>, and{" "}
              <span className="text-[#FF00FF]">OAuth</span> while you learn.
            </p>

            {/* Project Idea Input */}
            <div className="max-w-2xl mx-auto mb-8">
              <div className="relative">
                <textarea
                  value={projectIdea}
                  onChange={(e) => setProjectIdea(e.target.value)}
                  placeholder="Describe your app idea... (e.g., 'A SaaS for pet health tracking with payments')"
                  className="w-full h-32 px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#00f5ff]/50 resize-none"
                />
              </div>

              {!recommendedStack ? (
                <button
                  onClick={handleAnalyzeIdea}
                  disabled={isAnalyzing || !projectIdea.trim()}
                  className="w-full mt-4 px-8 py-4 bg-gradient-to-r from-[#00f5ff] via-[#FFD700] to-[#FF00FF] rounded-2xl font-semibold text-slate-950 hover:shadow-2xl hover:shadow-[#00f5ff]/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
                >
                  {isAnalyzing ? (
                    <>
                      <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                      Analyzing with Claude...
                    </>
                  ) : (
                    <>
                      Analyze Idea
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              ) : (
                <div className="mt-6 p-6 bg-white/5 border border-white/10 rounded-2xl text-left">
                  <h3 className="text-lg font-bold text-white mb-3 font-['Syne']">Recommended Stack</h3>
                  <p className="text-slate-300 mb-4">{recommendedStack.recommendation?.reasoning || "Stack recommendation generated"}</p>
                  <div className="mb-4 space-y-2">
                    <p className="text-sm text-slate-400">
                      <span className="text-[#00f5ff] font-semibold">Framework:</span> {recommendedStack.recommendation?.stack?.framework || "Next.js"}
                    </p>
                    <p className="text-sm text-slate-400">
                      <span className="text-[#FFD700] font-semibold">Database:</span> {recommendedStack.recommendation?.stack?.database || "Supabase"}
                    </p>
                    <p className="text-sm text-slate-400">
                      <span className="text-[#FF00FF] font-semibold">Hosting:</span> {recommendedStack.recommendation?.stack?.hosting || "Netlify"}
                    </p>
                  </div>
                  {!launchResult ? (
                    <>
                      <div className="mb-4">
                        <label htmlFor="repoName" className="block text-sm font-medium text-slate-300 mb-2">
                          Repository Name (optional)
                        </label>
                        <input
                          id="repoName"
                          type="text"
                          value={repoName}
                          onChange={(e) => setRepoName(e.target.value)}
                          placeholder="my-awesome-app"
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#00f5ff]/50"
                        />
                        <p className="text-xs text-slate-500 mt-1">
                          Leave empty to auto-generate from your project description
                        </p>
                      </div>
                      <button
                        onClick={handleLaunchCodespace}
                        disabled={isLaunching}
                        className="w-full px-8 py-4 bg-gradient-to-r from-[#00f5ff] to-[#FFD700] rounded-xl font-semibold text-slate-950 hover:shadow-xl hover:shadow-[#00f5ff]/30 transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isLaunching ? (
                          <>
                            <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                            Launching Codespace...
                          </>
                        ) : (
                          <>
                            <Github className="w-5 h-5" />
                            Launch Development Environment
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                          </>
                        )}
                      </button>
                      <p className="text-xs text-slate-500 mt-2 text-center">
                        Opens GitHub Codespace with Claude Code ready to provision your infrastructure
                      </p>
                    </>
                  ) : (
                    <div className="mt-4 p-4 bg-[#00f5ff]/10 border border-[#00f5ff]/30 rounded-xl">
                      <p className="text-white font-semibold mb-2">🚀 Codespace Launched!</p>
                      <p className="text-sm text-slate-300 mb-3">Your development environment is ready</p>
                      <a
                        href={launchResult.codespace_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-white text-slate-950 rounded-lg font-semibold hover:bg-slate-100 transition-all"
                      >
                        <Terminal className="w-5 h-5" />
                        Open Codespace
                        <ArrowRight className="w-4 h-4" />
                      </a>
                      <p className="text-xs text-slate-400 mt-2">
                        Repository: <a href={launchResult.repo_url} target="_blank" rel="noopener noreferrer" className="text-[#00f5ff] hover:underline">{launchResult.repo_url}</a>
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 font-['Syne']">
            <span className="bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              Why ShipMe v2.0
            </span>
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Terminal,
                title: "Watch AI Work",
                description: "See Claude Code provision infrastructure in real-time. Learn by watching every step in your terminal.",
                color: "cyan",
              },
              {
                icon: Shield,
                title: "Zero Credential Exposure",
                description: "Credentials stored in-memory only, encrypted, auto-destroyed. Never touch your dashboard.",
                color: "lime",
              },
              {
                icon: Zap,
                title: "5-10 Minutes Total",
                description: "From idea to fully deployed app with database, auth, and hosting. Not hours of manual setup.",
                color: "pink",
              },
            ].map((feature, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all group"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br from-${feature.color}-400/20 to-${feature.color}-600/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <feature.icon className={`w-6 h-6 text-${feature.color}-400`} />
                </div>
                <h3 className="text-xl font-bold text-white mb-2 font-['Syne']">{feature.title}</h3>
                <p className="text-slate-400 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 px-6 mt-20">
        <div className="max-w-6xl mx-auto text-center text-sm text-slate-500">
          <p>© 2026 ShipMe v2.0 • Built by Ayan Putatunda</p>
        </div>
      </footer>
    </div>
  );
}
