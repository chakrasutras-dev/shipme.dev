"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function AuthCallbackPage() {
  const [status, setStatus] = useState("Completing authentication...");

  useEffect(() => {
    // createBrowserClient has detectSessionInUrl: true by default,
    // so it automatically detects the ?code= parameter and exchanges it.
    // We just need to listen for the session to be established.
    const supabase = createClient();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("[Callback] Auth state change:", event, !!session);

        if (event === "SIGNED_IN" && session) {
          console.log("[Callback] Session established:", session.user?.email);

          // Store the GitHub provider token in an httpOnly cookie via API
          if (session.provider_token) {
            try {
              await fetch("/api/store-token", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ token: session.provider_token }),
              });
              console.log("[Callback] Provider token stored");
            } catch (e) {
              console.warn("[Callback] Failed to store provider token:", e);
            }
          }

          subscription.unsubscribe();
          setStatus("Authenticated! Launching...");
          window.location.href = "/?launch=pending";
          return;
        }

        if (event === "TOKEN_REFRESHED") {
          console.log("[Callback] Token refreshed");
        }
      }
    );

    // Also check hash params for errors (Supabase sometimes uses hash)
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const hashError = hashParams.get("error_description") || hashParams.get("error");
    if (hashError) {
      console.error("[Callback] Hash error:", hashError);
      subscription.unsubscribe();
      setStatus("Authentication failed.");
      window.location.href = `/?error=${encodeURIComponent(hashError)}`;
      return;
    }

    // Timeout fallback - if no auth event after 10 seconds, something went wrong
    const timeout = setTimeout(() => {
      console.error("[Callback] Timeout waiting for auth");
      subscription.unsubscribe();
      setStatus("Authentication timed out.");
      window.location.href = "/?error=timeout";
    }, 10000);

    return () => {
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
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
