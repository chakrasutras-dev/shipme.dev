"use client";

import { useEffect, useState } from "react";

export default function AuthCallbackPage() {
  const [status, setStatus] = useState("Completing authentication...");
  const [debugInfo, setDebugInfo] = useState("");

  useEffect(() => {
    const handleCallback = async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");

      // Check for errors in both query params and hash
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const error =
        params.get("error_description") ||
        params.get("error") ||
        hashParams.get("error_description") ||
        hashParams.get("error");

      if (error) {
        setStatus("Authentication failed.");
        setDebugInfo(`Error: ${error}`);
        setTimeout(() => {
          window.location.href = `/?error=${encodeURIComponent(error)}`;
        }, 5000);
        return;
      }

      if (!code) {
        setStatus("No authorization code found.");
        setDebugInfo("No ?code= parameter in URL");
        setTimeout(() => {
          window.location.href = "/?error=no_code";
        }, 5000);
        return;
      }

      try {
        setStatus("Exchanging code for session...");

        // Use a fresh, non-singleton Supabase client for the exchange.
        // The library knows how to read its own cookie-stored code verifier
        // (including proper URL-decoding), so we don't need to parse it manually.
        const { createBrowserClient } = await import("@supabase/ssr");
        const supabase = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          {
            isSingleton: false,
            auth: { detectSessionInUrl: false, flowType: "pkce" },
          }
        );

        const { data, error: exchangeError } =
          await supabase.auth.exchangeCodeForSession(code);

        if (exchangeError) {
          console.error("[Callback] Exchange error:", exchangeError);
          setStatus(`Exchange failed: ${exchangeError.message}`);
          setDebugInfo(`Error: ${exchangeError.message}`);
          setTimeout(() => {
            window.location.href = `/?error=${encodeURIComponent(exchangeError.message)}`;
          }, 10000);
          return;
        }

        console.log("[Callback] Session established successfully!");

        // Store the GitHub provider token as an httpOnly cookie
        if (data.session?.provider_token) {
          try {
            await fetch("/api/store-token", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
              body: JSON.stringify({ token: data.session.provider_token }),
            });
          } catch (e) {
            console.warn("[Callback] Failed to store provider token:", e);
          }
        }

        setStatus("Authenticated! Launching...");
        window.location.href = "/?launch=pending";
      } catch (err: any) {
        console.error("[Callback] Unexpected error:", err);
        setStatus(`Error: ${err.message}`);
        setDebugInfo(`Error: ${err.message}`);
      }
    };

    handleCallback();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="text-center max-w-lg mx-auto px-4">
        <div className="w-8 h-8 border-2 border-[#00f5ff] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-white text-lg mb-4">{status}</p>
        {debugInfo && (
          <pre className="text-left text-xs text-slate-400 bg-slate-900 p-4 rounded-lg whitespace-pre-wrap break-all">
            {debugInfo}
          </pre>
        )}
      </div>
    </div>
  );
}
