# Supabase Auth + Netlify + Next.js: Troubleshooting Guide

Critical lessons learned while implementing GitHub OAuth with Supabase on a Next.js app hosted on Netlify.

**Stack**: Next.js 16 (App Router) + Supabase Auth (PKCE) + `@supabase/ssr` v0.8.0 + Netlify

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Issue 1: Netlify Strips Set-Cookie on 302 Redirects](#issue-1-netlify-strips-set-cookie-on-302-redirects)
3. [Issue 2: detectSessionInUrl Cannot Be Disabled](#issue-2-detectsessioninurl-cannot-be-disabled)
4. [Issue 3: exchangeCodeForSession Race Condition](#issue-3-exchangecodeforsession-race-condition)
5. [Issue 4: Cookie Value Encoding (base64url)](#issue-4-cookie-value-encoding-base64url)
6. [Issue 5: Mismatched GitHub OAuth Client Secret](#issue-5-mismatched-github-oauth-client-secret)
7. [Issue 6: x-forwarded-host on Netlify](#issue-6-x-forwarded-host-on-netlify)
8. [The Working Solution](#the-working-solution)
9. [Key @supabase/ssr v0.8 Internals](#key-supabasessr-v08-internals)

---

## Architecture Overview

```
User clicks "Launch" → signInWithGitHub()
  → Supabase generates PKCE code_verifier + code_challenge
  → Code verifier stored in cookie (via @supabase/ssr)
  → Redirect to Supabase Auth → GitHub OAuth → Supabase callback
  → Supabase redirects to /auth/callback?code=<supabase_auth_code>
  → Callback page exchanges code for session
  → Redirect to /?launch=pending
  → Main page calls /api/launch-codespace
  → Server validates session, creates GitHub repo, returns Codespace URL
```

### Cookie Flow
- **Code verifier**: Stored by `createBrowserClient` via `document.cookie` during `signInWithOAuth`. Cookie name: `sb-<project-ref>-auth-token-code-verifier`. Value is base64url-encoded with `base64-` prefix.
- **Auth session**: After successful exchange, stored as chunked cookies: `sb-<ref>-auth-token.0`, `.1`, etc.
- **GitHub provider token**: Stored separately as an httpOnly cookie via `/api/store-token`.

---

## Issue 1: Netlify Strips Set-Cookie on 302 Redirects

### Symptom
After OAuth callback, the launch API returns 401 "Unauthorized". Debug shows 0 auth session cookies — only the PKCE code verifier cookie survived.

### Root Cause
Netlify's CDN **strips `Set-Cookie` headers from 302 redirect responses** returned by serverless functions (Next.js Route Handlers). When the callback was a Route Handler (`/auth/callback/route.ts`) that exchanged the code server-side and returned `NextResponse.redirect()`, the auth cookies were set on the response but stripped by Netlify before reaching the browser.

### What Doesn't Work
```typescript
// ❌ Route Handler approach — cookies are stripped on redirect
export async function GET(request: NextRequest) {
  const response = NextResponse.redirect(new URL('/', request.url))
  const supabase = createServerClient(url, key, {
    cookies: {
      setAll(cookies) {
        cookies.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)  // Set on response...
        )
      }
    }
  })
  await supabase.auth.exchangeCodeForSession(code)
  return response  // ...but Netlify strips Set-Cookie from 302!
}
```

### Solution
Use a **client-side page** (`page.tsx`) instead of a Route Handler for the callback. The browser client handles cookie storage natively via `document.cookie`, which Netlify can't interfere with.

### Key Takeaway
> **Never rely on server-side code exchange in Route Handlers on Netlify.** Use a client page for the OAuth callback.

---

## Issue 2: detectSessionInUrl Cannot Be Disabled

### Symptom
Setting `detectSessionInUrl: false` on `createBrowserClient` has no effect — the client still auto-detects `?code=` in the URL.

### Root Cause
In `@supabase/ssr` v0.8.0, `createBrowserClient` **always overrides** `detectSessionInUrl`:

```javascript
// node_modules/@supabase/ssr/dist/module/createBrowserClient.js
auth: {
    ...options?.auth,              // Your options come first
    detectSessionInUrl: isBrowser(), // Then THIS overrides to true!
    // ...
}
```

The spread order means `options.auth.detectSessionInUrl` is set first, then `detectSessionInUrl: isBrowser()` overwrites it. In a browser, `isBrowser()` is always `true`.

### Impact
- Every `createBrowserClient` instance in a browser has `detectSessionInUrl: true`
- The client's `_initialize()` method will auto-detect `?code=` and exchange it
- You cannot prevent this behavior via configuration

### Key Takeaway
> **`detectSessionInUrl: false` is silently ignored by `@supabase/ssr` v0.8.** Plan your callback page accordingly — the client WILL auto-exchange the code.

---

## Issue 3: exchangeCodeForSession Race Condition

### Symptom
Calling `exchangeCodeForSession(code)` explicitly on the callback page fails with: **"PKCE code verifier not found in storage"**

### Root Cause
Because `detectSessionInUrl` is always `true` (Issue 2), the following race occurs:

1. `createBrowserClient(...)` → constructor starts `_initialize()` (async)
2. `_initialize()` sees `?code=` → calls internal `_exchangeCodeForSession(code)`
3. Internal exchange **reads and removes** the code verifier from cookies
4. `_initialize()` completes
5. Your explicit `supabase.auth.exchangeCodeForSession(code)` runs
6. Tries to read code verifier → **already consumed** → throws error

The `exchangeCodeForSession` public method acquires a lock and waits for `_initialize()` to complete. By the time it runs, the code verifier is gone.

### Solution
**Don't call `exchangeCodeForSession()` explicitly.** Let `_initialize()` handle the exchange automatically. Use `getSession()` to wait for the result:

```typescript
const supabase = createBrowserClient(url, key, { isSingleton: false });

// getSession() waits for _initialize() to complete (including auto-exchange)
const { data: { session } } = await supabase.auth.getSession();

if (session) {
  // Exchange succeeded! session.provider_token has the GitHub token
}
```

### Key Takeaway
> **Never call `exchangeCodeForSession()` when using `createBrowserClient` on a page with `?code=` in the URL.** The auto-exchange handles it. Just check the session afterward.

---

## Issue 4: Cookie Value Encoding (base64url)

### Symptom
Reading the code verifier directly from `document.cookie` and sending it to Supabase's token endpoint fails with: **"code challenge does not match previously saved code verifier"**. The cookie value is 159 characters when the raw verifier should be ~64 characters.

### Root Cause
`@supabase/ssr` v0.8 uses **base64url encoding** for cookie values by default (`cookieEncoding: "base64url"`):

```javascript
// How values are stored:
encoded = "base64-" + stringToBase64URL(rawValue)
// Cookie: sb-xxx-code-verifier=base64-YWJjMTIzNDU2...

// How values are retrieved:
if (value.startsWith("base64-")) {
  decoded = stringFromBase64URL(value.substring(7))
}
```

Reading `document.cookie` directly gives you the encoded value. Sending this to the Supabase API fails because it expects the raw verifier.

### What Doesn't Work
```typescript
// ❌ Direct cookie read — gets base64url-encoded value
const rawCookieValue = document.cookie
  .split(';')
  .find(c => c.includes('code-verifier'))
  ?.split('=').slice(1).join('=');

// rawCookieValue is "base64-YWJjMTIz..." (encoded), NOT the raw verifier
```

### Solution
Use the Supabase client's storage adapter to read cookies — it handles decoding automatically. Or better yet, let the auto-exchange handle everything (see Issue 3).

### Key Takeaway
> **Don't read Supabase cookies from `document.cookie` directly.** They're base64url-encoded. Use the library's own methods to read them.

---

## Issue 5: Mismatched GitHub OAuth Client Secret

### Symptom
Supabase returns: **"Unable to exchange external code: <hash>"** — the error comes in the callback URL's query params/hash, before our code runs.

### Root Cause
The GitHub OAuth App's Client Secret was regenerated on GitHub but **not updated in Supabase's GitHub provider settings**. Supabase uses the Client Secret server-side to exchange the GitHub authorization code for tokens.

### How to Diagnose
- The error appears in the **callback URL** itself (not from our code): `?error=server_error&error_description=Unable+to+exchange+external+code`
- This means Supabase's server failed, not our client code
- Check: GitHub OAuth App's Client Secret last 8 chars vs. Supabase provider's Client Secret

### How to Fix
1. GitHub → Settings → Developer settings → OAuth Apps → your app
2. Generate a **new** client secret (copy immediately — shown once)
3. Supabase Dashboard → Authentication → Providers → GitHub
4. Paste the new Client Secret and **Save**
5. No app deployment needed — this is a server-side config change

### Key Takeaway
> **If you see "Unable to exchange external code", check that the GitHub OAuth Client Secret in Supabase matches the one in GitHub.** This is the most common cause.

---

## Issue 6: x-forwarded-host on Netlify

### Symptom
Server-side redirects go to internal Netlify URLs instead of the custom domain.

### Root Cause
On Netlify, `request.url` in Route Handlers returns the internal Netlify function URL, not the custom domain. Use the `x-forwarded-host` header instead:

```typescript
// ❌ Wrong — returns internal Netlify URL
const origin = new URL(request.url).origin

// ✅ Correct — returns custom domain
const host = request.headers.get('x-forwarded-host') || request.headers.get('host')
const protocol = request.headers.get('x-forwarded-proto') || 'https'
const origin = `${protocol}://${host}`
```

---

## The Working Solution

### Callback Page (`/auth/callback/page.tsx`)

```typescript
"use client";
import { useEffect, useState } from "react";

export default function AuthCallbackPage() {
  const [status, setStatus] = useState("Completing authentication...");

  useEffect(() => {
    const handleCallback = async () => {
      // 1. Check for errors in URL
      const params = new URLSearchParams(window.location.search);
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const error = params.get("error_description") || params.get("error")
        || hashParams.get("error_description") || hashParams.get("error");

      if (error) {
        window.location.href = `/?error=${encodeURIComponent(error)}`;
        return;
      }

      if (!params.get("code")) {
        window.location.href = "/?error=no_code";
        return;
      }

      // 2. Create a non-singleton client — its _initialize() will
      //    auto-exchange the ?code= (detectSessionInUrl is always true)
      const { createBrowserClient } = await import("@supabase/ssr");
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { isSingleton: false }
      );

      // 3. getSession() waits for _initialize() to complete
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        window.location.href = "/?error=exchange_failed";
        return;
      }

      // 4. Store the GitHub provider token as httpOnly cookie
      if (session.provider_token) {
        await fetch("/api/store-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ token: session.provider_token }),
        });
      }

      // 5. Redirect to trigger the pending launch
      window.location.href = "/?launch=pending";
    };

    handleCallback();
  }, []);

  return <div>{status}</div>;
}
```

### Key Configuration

**Middleware** — exclude `/auth/callback` to prevent session refresh interference:
```typescript
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|auth/callback|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

**Supabase Dashboard**:
- Site URL: `https://shipme.dev`
- Redirect URLs: `https://shipme.dev/**`

**GitHub OAuth App**:
- Authorization callback URL: `https://<project-ref>.supabase.co/auth/v1/callback`
- Client Secret must match what's in Supabase provider settings

---

## Key @supabase/ssr v0.8 Internals

### Cookie Encoding
- Default: `cookieEncoding: "base64url"`
- Values prefixed with `"base64-"` followed by base64url-encoded content
- The `cookie` npm package's `serialize`/`parse` functions handle HTTP cookie format
- Chunking: values > 3,180 chars are split into `.0`, `.1`, etc. cookies

### Storage Key
- Default: `sb-<project-ref>-auth-token` (derived from Supabase URL hostname)
- Code verifier: `sb-<ref>-auth-token-code-verifier`
- Session chunks: `sb-<ref>-auth-token.0`, `sb-<ref>-auth-token.1`, etc.

### createBrowserClient Forced Defaults
These cannot be overridden via options:
```javascript
flowType: "pkce"              // Always PKCE
autoRefreshToken: isBrowser() // Always true in browser
detectSessionInUrl: isBrowser() // Always true in browser
persistSession: true          // Always persisted
```

### Singleton Behavior
- `isSingleton: true` (default in browser): cached across all `createBrowserClient` calls
- `isSingleton: false`: new client each time, but same cookie storage
- On full page navigation (OAuth redirect), the singleton cache is lost (fresh JS context)

---

## Debugging Checklist

When auth isn't working, check in this order:

1. **Supabase Dashboard**: Is the GitHub provider enabled? Do Client ID and Secret match GitHub?
2. **Callback URL**: Does the error come in the URL params? → Supabase server-side issue (credentials)
3. **Cookies**: Open DevTools → Application → Cookies. Is `sb-<ref>-auth-token-code-verifier` present?
4. **Middleware**: Is `/auth/callback` excluded from the middleware matcher?
5. **Console logs**: Check for `_initialize()` errors in the browser console
6. **Network tab**: Check the Supabase token endpoint response for error details

---

*Last updated: February 2026*
*Applies to: @supabase/ssr v0.8.0, @supabase/auth-js v2.89.0, Next.js 16, Netlify*
