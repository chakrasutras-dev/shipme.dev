/**
 * OAuth Start - Initiates OAuth flow for Supabase or Netlify
 *
 * Query params:
 * - provider: 'supabase' or 'netlify'
 * - codespace_url: The user's Codespace URL
 * - state: Random state for CSRF protection
 */

exports.handler = async (event) => {
  try {
    const { provider, codespace_url, state } = event.queryStringParameters;

    if (!provider || !codespace_url || !state) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required parameters' })
      };
    }

    // Encode state data (includes Codespace URL for callback)
    const stateData = Buffer.from(JSON.stringify({
      codespace_url,
      state,
      provider
    })).toString('base64');

    // OAuth URLs for each provider
    const authUrls = {
      supabase: `https://api.supabase.com/v1/oauth/authorize?client_id=${process.env.SUPABASE_CLIENT_ID}&redirect_uri=https://oauth.shipme.dev/.netlify/functions/oauth-callback&response_type=code&state=${stateData}&scope=all`,
      netlify: `https://app.netlify.com/authorize?client_id=${process.env.NETLIFY_CLIENT_ID}&redirect_uri=https://oauth.shipme.dev/.netlify/functions/oauth-callback&response_type=code&state=${stateData}`
    };

    if (!authUrls[provider]) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid provider' })
      };
    }

    // Redirect to OAuth provider
    return {
      statusCode: 302,
      headers: {
        Location: authUrls[provider]
      }
    };

  } catch (error) {
    console.error('OAuth start error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};
