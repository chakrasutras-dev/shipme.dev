"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function ExchangePage() {
  const [status, setStatus] = useState("Completing authentication...");

  useEffect(() => {
    const exchange = async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");

      if (!code) {
        setStatus("No authorization code found.");
        window.location.href = "/?error=no_code";
        return;
      }

      try {
        const supabase = createClient();
        console.log("[Exchange] Exchanging code for session...");

        const { data, error } = await supabase.auth.exchangeCodeForSession(code);

        if (error) {
          console.error("[Exchange] Error:", error);
          setStatus("Authentication failed.");
          window.location.href = "/?error=auth_failed";
          return;
        }

        console.log("[Exchange] Session established:", !!data.session);
        console.log("[Exchange] User:", data.session?.user?.email);

        // Store the provider token if available
        if (data.session?.provider_token) {
          try {
            await fetch("/api/store-token", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ token: data.session.provider_token }),
            });
          } catch (e) {
            console.warn("[Exchange] Failed to store provider token:", e);
          }
        }

        setStatus("Authenticated! Launching...");
        window.location.href = "/?launch=pending";
      } catch (err) {
        console.error("[Exchange] Unexpected error:", err);
        setStatus("Something went wrong.");
        window.location.href = "/?error=exchange_failed";
      }
    };

    exchange();
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
