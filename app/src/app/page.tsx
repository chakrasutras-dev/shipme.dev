"use client";

import { useState, useEffect, useRef } from "react";
import { ArrowRight, Github, Zap, Shield, Terminal, Rocket, Sparkles, Check, ExternalLink, X, RefreshCw } from "lucide-react";
import Link from "next/link";
import { signInWithGitHub, getSession } from "@/lib/auth/supabase-auth";

type ConnectedAccounts = {
  github: boolean;
  supabase: boolean;
  netlify: boolean;
};

type StepStatus = 'pending' | 'in_progress' | 'done' | 'failed';

type ProvisionStep = {
  id: string;
  label: string;
  status: StepStatus;
  detail?: string;
};

type ProvisionResult = {
  github_repo_url: string;
  supabase_url: string;
  supabase_dashboard_url: string;
  netlify_url: string;
  netlify_admin_url: string;
  project_name: string;
};

const INITIAL_STEPS: ProvisionStep[] = [
  { id: 'github', label: 'Creating GitHub repository', status: 'pending' },
  { id: 'supabase', label: 'Provisioning Supabase database', status: 'pending' },
  { id: 'netlify', label: 'Deploying to Netlify', status: 'pending' },
];

export default function LandingPage() {
  const [projectIdea, setProjectIdea] = useState("");
  const [repoName, setRepoName] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [recommendedStack, setRecommendedStack] = useState<any>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [connectedAccounts, setConnectedAccounts] = useState<ConnectedAccounts>({
    github: false,
    supabase: false,
    netlify: false,
  });
  const [isCheckingAccounts, setIsCheckingAccounts] = useState(false);

  // Provisioning state
  const [isProvisioning, setIsProvisioning] = useState(false);
  const [provisionSteps, setProvisionSteps] = useState<ProvisionStep[]>(INITIAL_STEPS);
  const [provisionResult, setProvisionResult] = useState<ProvisionResult | null>(null);
  const [provisionError, setProvisionError] = useState<{ step: string; message: string } | null>(null);
  const [codespaceUrl, setCodespaceUrl] = useState<string | null>(null);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const allConnected = connectedAccounts.github && connectedAccounts.supabase && connectedAccounts.netlify;
  const showTimeline = isProvisioning || !!provisionResult || !!provisionError;

  const updateStep = (id: string, updates: Partial<ProvisionStep>) => {
    setProvisionSteps(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  // Fetch connected accounts status
  const refreshConnectedAccounts = async (): Promise<{ accounts: ConnectedAccounts; all_connected: boolean } | null> => {
    try {
      setIsCheckingAccounts(true);
      const res = await fetch("/api/connected-accounts", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setConnectedAccounts(data.accounts);
        return data;
      }
      return null;
    } catch (err) {
      console.error("Failed to check connected accounts:", err);
      return null;
    } finally {
      setIsCheckingAccounts(false);
    }
  };

  // Restore UI state saved to localStorage before an OAuth redirect
  const restoreUiState = () => {
    const savedIdea = localStorage.getItem("pendingProjectIdea");
    const savedStack = localStorage.getItem("pendingRecommendedStack");
    const savedRepo = localStorage.getItem("pendingRepoName");

    if (savedIdea) {
      setProjectIdea(savedIdea);
      localStorage.removeItem("pendingProjectIdea");
    }
    if (savedStack) {
      try { setRecommendedStack(JSON.parse(savedStack)); } catch {}
      localStorage.removeItem("pendingRecommendedStack");
    }
    if (savedRepo) {
      setRepoName(savedRepo);
      localStorage.removeItem("pendingRepoName");
    }
  };

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
        if (isLoggedIn) {
          refreshConnectedAccounts();
        }
      }
    } catch (error) {
      console.error("Analysis failed:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Unified init: check session, handle URL params, restore state
  useEffect(() => {
    const init = async () => {
      const session = await getSession();
      if (session) {
        setIsLoggedIn(true);
      }

      const urlParams = new URLSearchParams(window.location.search);

      // Handle OAuth success/error (Supabase/Netlify connect)
      const oauthSuccess = urlParams.get("oauth_success");
      const oauthError = urlParams.get("oauth_error");

      if (oauthSuccess || oauthError) {
        window.history.replaceState({}, "", "/");
        restoreUiState();
        if (oauthError) {
          alert(`OAuth connection failed: ${oauthError}`);
        }
        await refreshConnectedAccounts();
        return;
      }

      // Handle auth complete (after GitHub sign-in)
      const authComplete = urlParams.get("auth_complete") === "true";
      if (authComplete) {
        window.history.replaceState({}, "", "/");
        setIsLoggedIn(true);
        restoreUiState();
        await refreshConnectedAccounts();
        return;
      }

      // Handle errors
      const hasError = urlParams.get("error");
      if (hasError) {
        alert(`Authentication failed: ${hasError}. Please try again.`);
        window.history.replaceState({}, "", "/");
        return;
      }

      // If already logged in, fetch connected accounts
      if (session) {
        await refreshConnectedAccounts();
      }
    };

    init();
  }, []);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, []);

  const stopPolling = () => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  };

  const pollStatus = async (jobId: string) => {
    try {
      const res = await fetch(`/api/provision/status?job_id=${jobId}`, { credentials: 'include' });
      const data = await res.json();

      if (data.status === 'supabase_creating') {
        updateStep('supabase', { status: 'in_progress', detail: data.message || 'Initializing database...' });
      } else if (data.status === 'supabase_ready') {
        updateStep('supabase', { status: 'in_progress', detail: 'Database ready, creating Netlify site...' });
        updateStep('netlify', { status: 'in_progress' });
      } else if (data.status === 'done') {
        stopPolling();
        updateStep('supabase', { status: 'done' });
        updateStep('netlify', { status: 'done', detail: data.netlify_url });
        setProvisionResult({
          github_repo_url: data.github_repo_url,
          supabase_url: data.supabase_url,
          supabase_dashboard_url: data.supabase_dashboard_url,
          netlify_url: data.netlify_url,
          netlify_admin_url: data.netlify_admin_url,
          project_name: data.project_name,
        });
        setIsProvisioning(false);
      } else if (data.status === 'failed') {
        stopPolling();
        const failedStepId =
          data.error_step?.startsWith('netlify') ? 'netlify' :
          data.error_step?.startsWith('supabase') ? 'supabase' : 'github';
        updateStep(failedStepId, { status: 'failed', detail: data.error_message });
        setProvisionError({ step: data.error_step || 'unknown', message: data.error_message });
        setIsProvisioning(false);
      }
    } catch (err) {
      console.error('Polling error:', err);
    }
  };

  // Sign in with GitHub
  const handleGitHubSignIn = async () => {
    localStorage.setItem("pendingProjectIdea", projectIdea);
    if (recommendedStack) localStorage.setItem("pendingRecommendedStack", JSON.stringify(recommendedStack));
    if (repoName) localStorage.setItem("pendingRepoName", repoName);
    const { error } = await signInWithGitHub();
    if (error) {
      console.error("GitHub auth failed:", error);
      alert("GitHub authentication failed. Please try again.");
    }
  };

  // Connect Supabase or Netlify
  const connectProvider = (provider: "supabase" | "netlify") => {
    localStorage.setItem("pendingProjectIdea", projectIdea);
    if (recommendedStack) localStorage.setItem("pendingRecommendedStack", JSON.stringify(recommendedStack));
    if (repoName) localStorage.setItem("pendingRepoName", repoName);
    window.location.href = `/api/oauth/start?provider=${provider}`;
  };

  const handleShipIt = async () => {
    if (!allConnected) return;

    setIsProvisioning(true);
    setProvisionError(null);
    setProvisionResult(null);
    setCodespaceUrl(null);
    setProvisionSteps(INITIAL_STEPS.map(s => ({ ...s, status: 'pending' as StepStatus })));
    updateStep('github', { status: 'in_progress' });

    const finalRepoName = repoName.trim()
      ? repoName.toLowerCase().replace(/[^a-z0-9-]/g, '-')
      : projectIdea.substring(0, 50).toLowerCase().replace(/[^a-z0-9]+/g, '-');

    try {
      const res = await fetch('/api/provision/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ projectName: finalRepoName, description: projectIdea }),
      });
      const data = await res.json();

      if (!res.ok) {
        // Map the API step to the visual step
        const failedVisualStep =
          data.step === 'supabase_org' || data.step === 'supabase_auth' || data.step === 'supabase_create' ? 'supabase' :
          data.step === 'netlify_auth' ? 'netlify' : 'github';
        updateStep('github', { status: failedVisualStep === 'github' ? 'failed' : 'done' });
        if (failedVisualStep !== 'github') {
          updateStep(failedVisualStep, { status: 'failed', detail: data.error });
        } else {
          updateStep('github', { status: 'failed', detail: data.error });
        }
        setProvisionError({ step: data.step || 'github', message: data.error });
        setIsProvisioning(false);
        return;
      }

      updateStep('github', { status: 'done', detail: data.repo_url });
      updateStep('supabase', { status: 'in_progress', detail: 'Starting Supabase project...' });
      if (data.codespace_url) setCodespaceUrl(data.codespace_url);

      const jobId = data.job_id;
      // Poll immediately, then every 3s
      await pollStatus(jobId);
      pollIntervalRef.current = setInterval(() => pollStatus(jobId), 3000);
    } catch (err: any) {
      updateStep('github', { status: 'failed', detail: err.message });
      setProvisionError({ step: 'github', message: err.message });
      setIsProvisioning(false);
    }
  };

  const handleRetry = () => {
    stopPolling();
    setIsProvisioning(false);
    setProvisionError(null);
    setProvisionResult(null);
    setCodespaceUrl(null);
    setProvisionSteps(INITIAL_STEPS.map(s => ({ ...s, status: 'pending' as StepStatus })));
  };

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
                v3.0
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
              {!isLoggedIn && (
                <Link
                  href="/login"
                  className="text-xs text-slate-400 hover:text-white transition-colors px-3 py-1.5 rounded border border-white/10 hover:border-white/20"
                >
                  Sign in
                </Link>
              )}
              {isLoggedIn && (
                <button
                  onClick={async () => {
                    await fetch('/api/auth/signout', { method: 'POST', credentials: 'include' })
                    setIsLoggedIn(false)
                    setConnectedAccounts({ github: false, supabase: false, netlify: false })
                    setRecommendedStack(null)
                    handleRetry()
                  }}
                  className="text-xs text-slate-500 hover:text-slate-300 transition-colors px-2 py-1 rounded border border-white/10 hover:border-white/20"
                >
                  Sign out
                </button>
              )}
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
              <span className="text-sm text-slate-300">GitHub + Supabase + Netlify — fully provisioned in minutes</span>
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
              Describe your app. Connect your accounts. Click{" "}
              <span className="text-[#FFD700] font-semibold">Ship It</span> — ShipMe creates your{" "}
              <span className="text-white">GitHub repo</span>, provisions{" "}
              <span className="text-[#FFD700]">Supabase</span>, deploys to{" "}
              <span className="text-[#00f5ff]">Netlify</span>, and hands you a live URL.
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

                  {/* Show form OR timeline, never both */}
                  {!showTimeline ? (
                    <>
                      {/* Repository Name */}
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

                      {/* Connect Accounts */}
                      <div className="mb-4 p-4 bg-white/5 border border-white/10 rounded-xl">
                        <h4 className="text-sm font-bold text-white mb-3 font-['Syne']">Connect Your Accounts</h4>
                        <p className="text-xs text-slate-400 mb-3">
                          {isLoggedIn
                            ? "ShipMe will provision infrastructure using your connected accounts."
                            : "Sign in with GitHub first, then connect Supabase and Netlify."}
                        </p>
                        <div className="space-y-2">
                          {/* GitHub */}
                          <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                            <div className="flex items-center gap-3">
                              <Github className="w-5 h-5 text-white" />
                              <span className="text-sm text-white">GitHub</span>
                            </div>
                            {isLoggedIn || connectedAccounts.github ? (
                              <span className="flex items-center gap-1 text-xs text-emerald-400">
                                <Check className="w-4 h-4" /> Connected
                              </span>
                            ) : (
                              <button
                                onClick={handleGitHubSignIn}
                                className="flex items-center gap-1 text-xs px-3 py-1.5 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors border border-white/20"
                              >
                                Sign in <ExternalLink className="w-3 h-3" />
                              </button>
                            )}
                          </div>

                          {/* Supabase */}
                          <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                            <div className="flex items-center gap-3">
                              <svg className="w-5 h-5" viewBox="0 0 109 113" fill="none">
                                <path d="M63.7076 110.284C60.8481 113.885 55.0502 111.912 54.9813 107.314L53.9738 40.0627L99.1935 40.0627C107.384 40.0627 111.952 49.5228 106.859 55.9374L63.7076 110.284Z" fill="url(#sb1)"/>
                                <path d="M63.7076 110.284C60.8481 113.885 55.0502 111.912 54.9813 107.314L53.9738 40.0627L99.1935 40.0627C107.384 40.0627 111.952 49.5228 106.859 55.9374L63.7076 110.284Z" fill="url(#sb2)" fillOpacity="0.2"/>
                                <path d="M45.317 2.07103C48.1765 -1.53037 53.9745 0.442937 54.0434 5.041L54.4849 72.2922H9.83113C1.64038 72.2922 -2.92775 62.8321 2.1655 56.4175L45.317 2.07103Z" fill="#3ECF8E"/>
                                <defs>
                                  <linearGradient id="sb1" x1="53.9738" y1="54.974" x2="94.1635" y2="71.8295" gradientUnits="userSpaceOnUse">
                                    <stop stopColor="#249361"/><stop offset="1" stopColor="#3ECF8E"/>
                                  </linearGradient>
                                  <linearGradient id="sb2" x1="36.1558" y1="30.578" x2="54.4844" y2="65.0806" gradientUnits="userSpaceOnUse">
                                    <stop/><stop offset="1" stopOpacity="0"/>
                                  </linearGradient>
                                </defs>
                              </svg>
                              <span className="text-sm text-white">Supabase</span>
                            </div>
                            {connectedAccounts.supabase ? (
                              <div className="flex items-center gap-2">
                                <span className="flex items-center gap-1 text-xs text-emerald-400">
                                  <Check className="w-4 h-4" /> Connected
                                </span>
                                <button
                                  onClick={() => connectProvider("supabase")}
                                  className="text-xs text-slate-500 hover:text-slate-300 underline transition-colors"
                                >
                                  Reconnect
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => connectProvider("supabase")}
                                disabled={!isLoggedIn}
                                className="flex items-center gap-1 text-xs px-3 py-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg hover:bg-emerald-500/30 transition-colors border border-emerald-500/30 disabled:opacity-40 disabled:cursor-not-allowed"
                              >
                                Connect <ExternalLink className="w-3 h-3" />
                              </button>
                            )}
                          </div>

                          {/* Netlify */}
                          <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                            <div className="flex items-center gap-3">
                              <svg className="w-5 h-5" viewBox="0 0 256 256" fill="none">
                                <path d="M128 0L256 128L128 256L0 128L128 0Z" fill="#00C7B7"/>
                              </svg>
                              <span className="text-sm text-white">Netlify</span>
                            </div>
                            {connectedAccounts.netlify ? (
                              <div className="flex items-center gap-2">
                                <span className="flex items-center gap-1 text-xs text-emerald-400">
                                  <Check className="w-4 h-4" /> Connected
                                </span>
                                <button
                                  onClick={() => connectProvider("netlify")}
                                  className="text-xs text-slate-500 hover:text-slate-300 underline transition-colors"
                                >
                                  Reconnect
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => connectProvider("netlify")}
                                disabled={!isLoggedIn}
                                className="flex items-center gap-1 text-xs px-3 py-1.5 bg-[#00C7B7]/20 text-[#00C7B7] rounded-lg hover:bg-[#00C7B7]/30 transition-colors border border-[#00C7B7]/30 disabled:opacity-40 disabled:cursor-not-allowed"
                              >
                                Connect <ExternalLink className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>

                        {isCheckingAccounts && (
                          <p className="text-xs text-slate-500 mt-2 text-center">Checking connections...</p>
                        )}
                      </div>

                      {/* Ship It Button */}
                      <button
                        onClick={handleShipIt}
                        disabled={!allConnected}
                        className="w-full px-8 py-4 bg-gradient-to-r from-[#00f5ff] to-[#FFD700] rounded-xl font-semibold text-slate-950 hover:shadow-xl hover:shadow-[#00f5ff]/30 transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {!allConnected ? (
                          <>
                            <Shield className="w-5 h-5" />
                            Connect All Accounts to Ship
                          </>
                        ) : (
                          <>
                            <Rocket className="w-5 h-5" />
                            Ship It
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                          </>
                        )}
                      </button>
                      <p className="text-xs text-slate-500 mt-2 text-center">
                        {allConnected
                          ? "Creates repo, provisions Supabase, deploys to Netlify — all automatically"
                          : !isLoggedIn
                            ? "Sign in with GitHub first, then connect Supabase and Netlify"
                            : "Connect all three services above to ship your project"}
                      </p>
                    </>
                  ) : (
                    /* Progress Timeline */
                    <div className="mt-2 space-y-4">
                      <h4 className="text-sm font-bold text-white font-['Syne']">
                        {provisionResult ? "Your app is live!" : provisionError ? "Provisioning failed" : "Shipping your project..."}
                      </h4>

                      {/* Step indicators */}
                      <div className="space-y-3">
                        {provisionSteps.map((step) => (
                          <div key={step.id} className="flex items-start gap-3">
                            <div className="w-6 h-6 flex-shrink-0 flex items-center justify-center mt-0.5">
                              {step.status === 'done' && (
                                <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                  <Check className="w-3 h-3 text-emerald-400" />
                                </div>
                              )}
                              {step.status === 'in_progress' && (
                                <div className="w-4 h-4 border-2 border-[#00f5ff] border-t-transparent rounded-full animate-spin" />
                              )}
                              {step.status === 'failed' && (
                                <div className="w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center">
                                  <X className="w-3 h-3 text-red-400" />
                                </div>
                              )}
                              {step.status === 'pending' && (
                                <div className="w-4 h-4 rounded-full border border-white/20" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm font-medium ${
                                step.status === 'done' ? 'text-emerald-400' :
                                step.status === 'failed' ? 'text-red-400' :
                                step.status === 'in_progress' ? 'text-white' :
                                'text-slate-500'
                              }`}>
                                {step.label}
                              </p>
                              {step.detail && (
                                <p className="text-xs text-slate-400 mt-0.5 truncate">{step.detail}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Error state */}
                      {provisionError && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                          <p className="text-sm text-red-300 leading-relaxed">{provisionError.message}</p>
                          <button
                            onClick={handleRetry}
                            className="mt-2 flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 transition-colors"
                          >
                            <RefreshCw className="w-3 h-3" /> Try again
                          </button>
                        </div>
                      )}

                      {/* Success state */}
                      {provisionResult && (
                        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl space-y-3">
                          <div className="space-y-2">
                            <a
                              href={provisionResult.netlify_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-sm text-[#00f5ff] hover:text-[#00f5ff]/80 transition-colors font-medium"
                            >
                              <ExternalLink className="w-4 h-4 flex-shrink-0" />
                              <span className="truncate">{provisionResult.netlify_url}</span>
                            </a>
                            <a
                              href={provisionResult.supabase_dashboard_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
                            >
                              <ExternalLink className="w-4 h-4 flex-shrink-0" />
                              <span>Supabase Dashboard</span>
                            </a>
                            <a
                              href={provisionResult.github_repo_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-sm text-slate-300 hover:text-white transition-colors"
                            >
                              <Github className="w-4 h-4 flex-shrink-0" />
                              <span className="truncate">{provisionResult.github_repo_url}</span>
                            </a>
                          </div>

                          {codespaceUrl && (
                            <a
                              href={codespaceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-white/10 text-white rounded-lg hover:bg-white/15 transition-colors text-sm border border-white/20"
                            >
                              <Terminal className="w-4 h-4" />
                              Open in Codespace (optional dev environment)
                            </a>
                          )}
                        </div>
                      )}
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
              Why ShipMe v3.0
            </span>
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Zap,
                title: "Instant Infrastructure",
                description: "ShipMe provisions GitHub, Supabase, and Netlify automatically — no terminal, no config files, no manual steps.",
                color: "cyan",
              },
              {
                icon: Shield,
                title: "Errors, Not Black Boxes",
                description: "Every step is visible in the UI. If something fails you see exactly why and can fix it immediately.",
                color: "lime",
              },
              {
                icon: Terminal,
                title: "Dev-Ready Codespace",
                description: "After shipping, open a Codespace with all credentials pre-loaded. Run npm run dev and start building.",
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
          <p>&copy; 2026 ShipMe v3.0 &bull; Built by Ayan Putatunda</p>
        </div>
      </footer>
    </div>
  );
}
