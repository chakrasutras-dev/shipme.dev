"use client";

import { useEffect, useState } from "react";

export default function AuthCallbackPage() {
  const [status, setStatus] = useState("Completing authentication...");
  const [debugInfo, setDebugInfo] = useState("");

  useEffect(() => {
    const handleCallback = async () => {
      const params = new URLSearchParams(window.location.search);

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

      if (!params.get("code")) {
        setStatus("No authorization code found.");
        setDebugInfo("No ?code= parameter in URL");
        setTimeout(() => {
          window.location.href = "/?error=no_code";
        }, 5000);
        return;
      }

      try {
        setStatus("Exchanging code for session...");

        // IMPORTANT: @supabase/ssr's createBrowserClient ALWAYS overrides
        // detectSessionInUrl to true in browsers (cannot be disabled).
        // This means _initialize() will auto-detect ?code= in the URL
        // and exchange it automatically using the cookie-stored code verifier.
        //
        // We must NOT call exchangeCodeForSession() explicitly — it would
        // race with _initialize() and fail ("code verifier not found"
        // because _initialize() already consumed it).
        //
        // Instead, just create the client and let _initialize() handle it.
        // getSession() waits for _initialize() to complete.
        const { createBrowserClient } = await import("@supabase/ssr");
        const supabase = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          { isSingleton: false }
        );

        // getSession() waits for _initialize() to complete,
        // which includes the automatic code exchange.
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          const errorMsg = "Session could not be established after code exchange";
          console.error("[Callback]", errorMsg);
          setStatus("Exchange failed.");
          setDebugInfo(errorMsg);
          setTimeout(() => {
            window.location.href = `/?error=${encodeURIComponent(errorMsg)}`;
          }, 10000);
          return;
        }

        console.log("[Callback] Session established successfully!");

        // Store the GitHub provider token as an httpOnly cookie
        if (session.provider_token) {
          try {
            await fetch("/api/store-token", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
              body: JSON.stringify({ token: session.provider_token }),
            });
          } catch (e) {
            console.warn("[Callback] Failed to store provider token:", e);
          }
        }

        setStatus("Authenticated! Redirecting...");
        window.location.href = "/?auth_complete=true";
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
