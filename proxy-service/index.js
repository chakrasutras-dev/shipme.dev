/**
 * DevFlow Proxy Service
 * Credential injection and domain allowlisting for secure automation
 */

import net from 'net'
import fetch from 'node-fetch'
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const SOCKET_PATH = '/var/run/proxy.sock'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// Domain allowlist
const ALLOWED_DOMAINS = [
  'github.com',
  'api.github.com',
  'vercel.com',
  'api.vercel.com',
  'supabase.com',
  'api.supabase.io',
  'stripe.com',
  'api.stripe.com',
  'docs.github.com',
  'docs.vercel.com',
  'supabase.com/docs',
]

class ProxyService {
  constructor() {
    this.server = null
  }

  async getCredentials(userId, service) {
    const { data, error } = await supabase
      .from('user_credentials')
      .select('encrypted_token')
      .eq('user_id', userId)
      .eq('service', service)
      .single()

    if (error || !data) {
      throw new Error(`Credentials not found for service: ${service}`)
    }

    // In production, decrypt the token using a proper encryption service
    // For now, return as-is
    return data.encrypted_token
  }

  isAllowedDomain(url) {
    try {
      const domain = new URL(url).hostname
      return ALLOWED_DOMAINS.some((allowed) => domain.endsWith(allowed))
    } catch (error) {
      return false
    }
  }

  async handleRequest(request) {
    const { userId, service, method, url, headers = {}, body } = request

    // Validate domain
    if (!this.isAllowedDomain(url)) {
      await this.logBlocked(userId, url, 'Domain not in allowlist')
      throw new Error(`Domain not allowed: ${new URL(url).hostname}`)
    }

    // Get credentials
    let credentials
    try {
      credentials = await this.getCredentials(userId, service)
    } catch (error) {
      console.error('[Proxy] Credentials error:', error)
      throw error
    }

    // Inject credentials into headers
    const authHeaders = {
      ...headers,
      Authorization: `Bearer ${credentials}`,
      'User-Agent': 'DevFlow-Automation/1.0',
    }

    // Log request
    await this.logRequest(userId, service, method, url, 'pending')

    try {
      // Make request to external service
      const response = await fetch(url, {
        method,
        headers: authHeaders,
        body: body ? JSON.stringify(body) : undefined,
      })

      const responseBody = await response.text()

      // Log successful response
      await this.logRequest(userId, service, method, url, 'success', response.status)

      // Return sanitized response (no credentials)
      return {
        statusCode: response.status,
        headers: this.sanitizeHeaders(response.headers),
        body: responseBody,
      }
    } catch (error) {
      // Log error
      await this.logRequest(userId, service, method, url, 'error', null, error.message)
      throw error
    }
  }

  sanitizeHeaders(headers) {
    const sanitized = {}
    const allowedHeaders = ['content-type', 'content-length', 'date']

    headers.forEach((value, key) => {
      if (allowedHeaders.includes(key.toLowerCase())) {
        sanitized[key] = value
      }
    })

    return sanitized
  }

  async logRequest(userId, service, method, url, status, statusCode = null, error = null) {
    await supabase.from('audit_logs').insert({
      user_id: userId,
      event_type: 'api_call',
      status,
      metadata: {
        service,
        method,
        url,
        statusCode,
        error,
      },
    })
  }

  async logBlocked(userId, url, reason) {
    await supabase.from('audit_logs').insert({
      user_id: userId,
      event_type: 'security_event',
      status: 'blocked',
      metadata: {
        event: 'blocked_request',
        url,
        reason,
      },
    })
  }

  start() {
    this.server = net.createServer((socket) => {
      console.log('[Proxy] Client connected')

      socket.on('data', async (data) => {
        try {
          const request = JSON.parse(data.toString())
          console.log('[Proxy] Request:', request.service, request.method, request.url)

          const response = await this.handleRequest(request)

          socket.write(JSON.stringify(response))
        } catch (error) {
          console.error('[Proxy] Request error:', error)
          socket.write(
            JSON.stringify({
              error: error.message,
              statusCode: 500,
            })
          )
        }
      })

      socket.on('error', (error) => {
        console.error('[Proxy] Socket error:', error)
      })

      socket.on('end', () => {
        console.log('[Proxy] Client disconnected')
      })
    })

    this.server.listen(SOCKET_PATH, () => {
      console.log(`[Proxy] DevFlow Proxy Service listening on ${SOCKET_PATH}`)
      console.log(`[Proxy] Allowed domains: ${ALLOWED_DOMAINS.length}`)
    })

    this.server.on('error', (error) => {
      console.error('[Proxy] Server error:', error)
    })
  }

  stop() {
    if (this.server) {
      this.server.close()
    }
  }
}

// Start proxy service
const proxy = new ProxyService()
proxy.start()

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('[Proxy] Shutting down...')
  proxy.stop()
  process.exit(0)
})
