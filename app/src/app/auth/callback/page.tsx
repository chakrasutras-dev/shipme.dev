"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function AuthCallbackPage() {
  const [status, setStatus] = useState("Completing authentication...");

  useEffect(() => {
    const handleCallback = async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");

      // Also check hash params (Supabase sometimes uses hash for errors)
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const hashError = hashParams.get("error_description") || hashParams.get("error");

      if (hashError) {
        console.error("[Callback] Hash error:", hashError);
        setStatus("Authentication failed.");
        window.location.href = `/?error=${encodeURIComponent(hashError)}`;
        return;
      }

      if (!code) {
        console.error("[Callback] No code in URL");
        setStatus("No authorization code found.");
        window.location.href = "/?error=no_code";
        return;
      }

      try {
        const supabase = createClient();
        console.log("[Callback] Exchanging code for session (client-side)...");

        const { data, error } = await supabase.auth.exchangeCodeForSession(code);

        if (error) {
          console.error("[Callback] Exchange error:", error);
          setStatus("Authentication failed.");
          window.location.href = "/?error=auth_failed";
          return;
        }

        console.log("[Callback] Session established:", !!data.session);
        console.log("[Callback] User:", data.session?.user?.email);

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
      } catch (err) {
        console.error("[Callback] Unexpected error:", err);
        setStatus("Something went wrong.");
        window.location.href = "/?error=exchange_failed";
      }
    };

    handleCallback();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-[#00f5ff] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-white text-lg">{status}</p>
      </div>
    </div>
  );
}
