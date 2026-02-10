"use client";

import { useEffect, useState } from "react";

export default function AuthCallbackPage() {
  const [status, setStatus] = useState("Completing authentication...");
  const [debugInfo, setDebugInfo] = useState("");

  useEffect(() => {
    const handleCallback = async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");

      // Check for errors in hash
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const hashError =
        hashParams.get("error_description") || hashParams.get("error");

      if (hashError) {
        setStatus("Authentication failed.");
        setDebugInfo(`Hash error: ${hashError}`);
        setTimeout(() => {
          window.location.href = `/?error=${encodeURIComponent(hashError)}`;
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

      // Read all cookies and find the code verifier
      const allCookies = document.cookie;
      const cookieList = allCookies.split(";").map((c) => c.trim());
      const codeVerifierCookie = cookieList.find((c) =>
        c.includes("code-verifier")
      );

      let codeVerifier: string | null = null;
      if (codeVerifierCookie) {
        // Cookie format: name=value
        const eqIndex = codeVerifierCookie.indexOf("=");
        codeVerifier = codeVerifierCookie.substring(eqIndex + 1);
      }

      const debugStr = [
        `Code: ${code.substring(0, 8)}...`,
        `Cookies: ${cookieList.length}`,
        `Code verifier found: ${!!codeVerifier}`,
        `Code verifier length: ${codeVerifier?.length || 0}`,
        `Cookie names: ${cookieList.map((c) => c.split("=")[0]).join(", ")}`,
      ].join("\n");

      console.log("[Callback] Debug info:\n", debugStr);
      setDebugInfo(debugStr);

      if (!codeVerifier) {
        setStatus("Code verifier not found in cookies!");
        setTimeout(() => {
          window.location.href = "/?error=no_code_verifier";
        }, 10000);
        return;
      }

      // Call Supabase token endpoint DIRECTLY (bypass @supabase/ssr)
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      try {
        setStatus("Exchanging code for session (direct API call)...");

        const response = await fetch(
          `${supabaseUrl}/auth/v1/token?grant_type=pkce`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              apikey: supabaseKey!,
              Authorization: `Bearer ${supabaseKey}`,
            },
            body: JSON.stringify({
              auth_code: code,
              code_verifier: codeVerifier,
            }),
          }
        );

        const result = await response.json();
        console.log("[Callback] Token response status:", response.status);
        console.log("[Callback] Token response:", JSON.stringify(result, null, 2));

        if (!response.ok) {
          setStatus(`Exchange failed: ${result.error_description || result.error || result.msg || "Unknown error"}`);
          setDebugInfo(
            `${debugStr}\n\nAPI Error (${response.status}): ${JSON.stringify(result)}`
          );
          setTimeout(() => {
            window.location.href = `/?error=${encodeURIComponent(result.error_description || result.error || "exchange_failed")}`;
          }, 10000);
          return;
        }

        // Success! Now store the session using the browser Supabase client
        const { createBrowserClient } = await import("@supabase/ssr");
        const supabase = createBrowserClient(supabaseUrl!, supabaseKey!, {
          isSingleton: false,
          auth: { detectSessionInUrl: false, flowType: "pkce" },
        });

        // Set the session manually
        const { error: setError } = await supabase.auth.setSession({
          access_token: result.access_token,
          refresh_token: result.refresh_token,
        });

        if (setError) {
          console.error("[Callback] setSession error:", setError);
          setStatus(`Session storage failed: ${setError.message}`);
          return;
        }

        console.log("[Callback] Session established successfully!");

        // Store the GitHub provider token
        if (result.provider_token) {
          try {
            await fetch("/api/store-token", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
              body: JSON.stringify({ token: result.provider_token }),
            });
          } catch (e) {
            console.warn("[Callback] Failed to store provider token:", e);
          }
        }

        // Clean up the code verifier cookie
        document.cookie = `${codeVerifierCookie!.split("=")[0]}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;

        setStatus("Authenticated! Launching...");
        window.location.href = "/?launch=pending";
      } catch (err: any) {
        console.error("[Callback] Unexpected error:", err);
        setStatus(`Error: ${err.message}`);
        setDebugInfo(`${debugStr}\n\nError: ${err.message}`);
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
