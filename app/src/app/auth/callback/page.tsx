"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";

export default function AuthCallbackPage() {
  const [status, setStatus] = useState("Completing authentication...");

  useEffect(() => {
    const handleCallback = async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");

      // Check for errors in hash (Supabase error redirects)
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const hashError =
        hashParams.get("error_description") || hashParams.get("error");

      if (hashError) {
        console.error("[Callback] Error in hash:", hashError);
        setStatus("Authentication failed.");
        window.location.href = `/?error=${encodeURIComponent(hashError)}`;
        return;
      }

      if (!code) {
        console.error("[Callback] No code found in URL");
        setStatus("No authorization code found.");
        window.location.href = "/?error=no_code";
        return;
      }

      // Debug: log all cookies
      const allCookies = document.cookie;
      console.log("[Callback] All cookies:", allCookies);
      console.log("[Callback] Code:", code);

      // Check for code verifier
      const codeVerifierCookie = document.cookie
        .split(";")
        .find((c) => c.trim().includes("code-verifier"));
      console.log("[Callback] Code verifier cookie:", codeVerifierCookie?.trim() || "NOT FOUND");

      try {
        // Create a fresh, non-singleton client with auto-detection DISABLED
        // to prevent any race conditions with auto-exchange.
        const supabase = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          {
            isSingleton: false,
            auth: {
              detectSessionInUrl: false,
              flowType: "pkce",
            },
          }
        );

        console.log("[Callback] Exchanging code for session...");
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);

        if (error) {
          console.error("[Callback] Exchange error:", error.message);
          console.error("[Callback] Exchange error details:", JSON.stringify(error));
          setStatus(`Exchange failed: ${error.message}`);
          // Show error on page instead of redirecting immediately
          setTimeout(() => {
            window.location.href = `/?error=${encodeURIComponent(error.message)}`;
          }, 3000);
          return;
        }

        console.log("[Callback] Session established:", !!data.session);
        console.log("[Callback] User:", data.session?.user?.email);
        console.log("[Callback] Provider token:", !!data.session?.provider_token);

        // Store the GitHub provider token in an httpOnly cookie via API
        if (data.session?.provider_token) {
          try {
            await fetch("/api/store-token", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
              body: JSON.stringify({ token: data.session.provider_token }),
            });
            console.log("[Callback] Provider token stored");
          } catch (e) {
            console.warn("[Callback] Failed to store provider token:", e);
          }
        }

        setStatus("Authenticated! Launching...");
        window.location.href = "/?launch=pending";
      } catch (err: any) {
        console.error("[Callback] Unexpected error:", err);
        setStatus(`Error: ${err.message}`);
        setTimeout(() => {
          window.location.href = `/?error=${encodeURIComponent(err.message)}`;
        }, 3000);
      }
    };

    handleCallback();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-[#00f5ff] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-white text-lg">{status}</p>
        <p className="text-slate-500 text-sm mt-2">Check browser console for details</p>
      </div>
    </div>
  );
}
