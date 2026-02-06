# ShipMe OAuth Proxy

OAuth proxy server for ShipMe.dev - handles Supabase and Netlify OAuth flows in GitHub Codespaces.

## Purpose

This proxy enables OAuth authentication for users in GitHub Codespaces, where each Codespace has a unique URL. Instead of requiring users to manually create API tokens, this proxy:

1. Receives OAuth callbacks at a fixed URL (`oauth.shipme.dev`)
2. Exchanges authorization codes for access tokens
3. Forwards tokens to the user's Codespace
4. Enables seamless username/password authentication

## Architecture

```
User's Codespace (unique URL)
    ↓
Opens OAuth flow via proxy
    ↓
User logs in on Supabase/Netlify
    ↓
OAuth callback → oauth.shipme.dev
    ↓
Proxy exchanges code for token
    ↓
Proxy forwards token to Codespace
    ↓
User continues with provisioning
```

## Deployment

### Prerequisites

1. Supabase OAuth app credentials
2. Netlify OAuth app credentials
3. Netlify account for deployment

### Environment Variables

Set these in your Netlify dashboard:

```
SUPABASE_CLIENT_ID=<your-supabase-oauth-client-id>
SUPABASE_CLIENT_SECRET=<your-supabase-oauth-client-secret>
NETLIFY_CLIENT_ID=<your-netlify-oauth-client-id>
NETLIFY_CLIENT_SECRET=<your-netlify-oauth-client-secret>
```

### Deploy to Netlify

1. Push this repo to GitHub
2. In Netlify dashboard:
   - New site from Git
   - Connect to this repo
   - Deploy settings are in `netlify.toml`
3. Set environment variables (above)
4. Configure custom domain: `oauth.shipme.dev`

## API Endpoints

### `GET /.netlify/functions/oauth-start`

Initiates OAuth flow.

**Query Parameters:**
- `provider` (required): `supabase` or `netlify`
- `codespace_url` (required): The user's Codespace URL
- `state` (required): Random state for CSRF protection

**Example:**
```
https://oauth.shipme.dev/.netlify/functions/oauth-start?provider=supabase&codespace_url=https://xxx-54321.app.github.dev&state=abc123
```

### `GET /.netlify/functions/oauth-callback`

Receives OAuth callback from provider.

**Query Parameters:**
- `code` (required): Authorization code from OAuth provider
- `state` (required): Encoded state containing Codespace URL and provider

**Returns:**
- HTML success page (auto-closes after 3 seconds)
- Forwards token to Codespace asynchronously

## Security

- Uses HTTPS for all communication
- State parameter encodes Codespace URL (Base64)
- Tokens are forwarded immediately and not stored
- Client secrets stored as environment variables in Netlify
- OAuth redirect URIs are fixed and validated by providers

## Local Development

Not applicable - this proxy must run at a fixed public URL for OAuth to work.

For testing, deploy to a staging Netlify site first.

## OAuth App Configuration

### Supabase OAuth App

Create at: https://supabase.com/dashboard/org/_/apps

- **Name:** ShipMe
- **Redirect URI:** `https://oauth.shipme.dev/.netlify/functions/oauth-callback`
- **Scopes:** All

### Netlify OAuth App

Create at: https://app.netlify.com/user/applications

- **Name:** ShipMe
- **Redirect URI:** `https://oauth.shipme.dev/.netlify/functions/oauth-callback`

## Troubleshooting

### "Missing credentials for [provider]"

Ensure environment variables are set in Netlify dashboard.

### "Token exchange failed"

Check that OAuth app credentials are correct and redirect URI matches exactly.

### "Failed to forward token to Codespace"

User's Codespace may be stopped or unreachable. User can retry the OAuth flow.

## License

MIT

## Author

Ayan Putatunda - ShipMe.dev
