#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
/**
 * ShipMe Netlify MCP Server
 *
 * Provides tools for Netlify site creation, configuration, and deployment.
 * Enables automated hosting and continuous deployment setup.
 */
const NETLIFY_API_URL = 'https://api.netlify.com/api/v1';
class NetlifyMCPServer {
    server;
    accessToken;
    constructor(config) {
        this.accessToken = config.accessToken;
        this.server = new Server({
            name: 'shipme-netlify-mcp',
            version: '1.0.0'
        }, {
            capabilities: {
                tools: {}
            }
        });
        this.setupHandlers();
    }
    setupHandlers() {
        // List available tools
        this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
            tools: [
                {
                    name: 'create_site',
                    description: 'Create a new Netlify site, optionally linked to a GitHub repository',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            name: {
                                type: 'string',
                                description: 'Site name (must be unique, will be slugified)'
                            },
                            repo: {
                                type: 'string',
                                description: 'Optional GitHub repository in format "owner/repo" for continuous deployment'
                            }
                        },
                        required: ['name']
                    }
                },
                {
                    name: 'configure_env_vars',
                    description: 'Configure environment variables for a Netlify site',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            site_id: {
                                type: 'string',
                                description: 'Netlify site ID'
                            },
                            env_vars: {
                                type: 'object',
                                description: 'Object with environment variable key-value pairs',
                                additionalProperties: {
                                    type: 'string'
                                }
                            }
                        },
                        required: ['site_id', 'env_vars']
                    }
                },
                {
                    name: 'deploy_site',
                    description: 'Trigger a new deployment for a Netlify site',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            site_id: {
                                type: 'string',
                                description: 'Netlify site ID'
                            },
                            directory: {
                                type: 'string',
                                description: 'Optional build directory to deploy (e.g., "dist", ".next")',
                                default: '.'
                            },
                            branch: {
                                type: 'string',
                                description: 'Git branch to deploy',
                                default: 'main'
                            }
                        },
                        required: ['site_id']
                    }
                },
                {
                    name: 'get_site_info',
                    description: 'Get information about a Netlify site (status, URL, build settings)',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            site_id: {
                                type: 'string',
                                description: 'Netlify site ID'
                            }
                        },
                        required: ['site_id']
                    }
                }
            ]
        }));
        // Handle tool calls
        this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
            const { name, arguments: args } = request.params;
            try {
                switch (name) {
                    case 'create_site':
                        return await this.createSite(args);
                    case 'configure_env_vars':
                        return await this.configureEnvVars(args);
                    case 'deploy_site':
                        return await this.deploySite(args);
                    case 'get_site_info':
                        return await this.getSiteInfo(args);
                    default:
                        throw new Error(`Unknown tool: ${name}`);
                }
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify({
                                success: false,
                                error: errorMessage
                            })
                        }
                    ]
                };
            }
        });
    }
    async createSite(params) {
        const { name, repo } = params;
        const body = {
            name: name.toLowerCase().replace(/[^a-z0-9-]/g, '-')
        };
        // If repo provided, configure GitHub integration
        if (repo) {
            const [owner, repoName] = repo.split('/');
            if (!owner || !repoName) {
                throw new Error('Repository must be in format "owner/repo"');
            }
            body.repo = {
                provider: 'github',
                repo: repo,
                private: false,
                branch: 'main',
                cmd: 'npm run build',
                dir: '.next' // Default for Next.js
            };
        }
        const response = await fetch(`${NETLIFY_API_URL}/sites`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to create Netlify site');
        }
        const site = await response.json();
        const result = {
            success: true,
            site_id: site.id,
            site_name: site.name,
            url: site.url || `https://${site.name}.netlify.app`,
            admin_url: site.admin_url,
            deploy_url: site.deploy_url
        };
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify(result, null, 2)
                }
            ]
        };
    }
    async configureEnvVars(params) {
        const { site_id, env_vars } = params;
        let setCount = 0;
        const errors = [];
        // Set each environment variable
        for (const [key, value] of Object.entries(env_vars)) {
            try {
                const response = await fetch(`${NETLIFY_API_URL}/accounts/-/env/${key}`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${this.accessToken}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        context: 'production',
                        scope: 'builds',
                        values: [
                            {
                                value: value,
                                context: 'all'
                            }
                        ]
                    })
                });
                if (response.ok) {
                    setCount++;
                }
                else {
                    // Try alternative method (site-specific env vars)
                    const altResponse = await fetch(`${NETLIFY_API_URL}/sites/${site_id}/env`, {
                        method: 'PATCH',
                        headers: {
                            'Authorization': `Bearer ${this.accessToken}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            [key]: value
                        })
                    });
                    if (altResponse.ok) {
                        setCount++;
                    }
                    else {
                        errors.push(`Failed to set ${key}`);
                    }
                }
            }
            catch (error) {
                errors.push(`Error setting ${key}: ${error.message}`);
            }
        }
        if (errors.length > 0 && setCount === 0) {
            throw new Error(`Failed to set environment variables: ${errors.join(', ')}`);
        }
        const result = {
            success: true,
            vars_set: setCount,
            message: `Set ${setCount} environment variable(s)${errors.length > 0 ? ` (${errors.length} failed)` : ''}`
        };
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify(result, null, 2)
                }
            ]
        };
    }
    async deploySite(params) {
        const { site_id, directory = '.', branch = 'main' } = params;
        // Trigger a new build
        const response = await fetch(`${NETLIFY_API_URL}/sites/${site_id}/builds`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                clear_cache: false
            })
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to trigger deployment');
        }
        const build = await response.json();
        const result = {
            success: true,
            deploy_id: build.deploy_id,
            build_id: build.id,
            deploy_url: build.deploy_url,
            state: build.state,
            message: `Deployment triggered successfully. State: ${build.state}`
        };
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify(result, null, 2)
                }
            ]
        };
    }
    async getSiteInfo(params) {
        const { site_id } = params;
        const response = await fetch(`${NETLIFY_API_URL}/sites/${site_id}`, {
            headers: {
                'Authorization': `Bearer ${this.accessToken}`,
                'Content-Type': 'application/json'
            }
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to get site info');
        }
        const site = await response.json();
        const result = {
            success: true,
            site_id: site.id,
            site_name: site.name,
            url: site.url || `https://${site.name}.netlify.app`,
            admin_url: site.admin_url,
            state: site.state,
            created_at: site.created_at,
            updated_at: site.updated_at,
            build_settings: site.build_settings
        };
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify(result, null, 2)
                }
            ]
        };
    }
    async run() {
        const transport = new StdioServerTransport();
        await this.server.connect(transport);
        console.error('ShipMe Netlify MCP Server running on stdio');
    }
}
// Start the server
const accessToken = process.env.NETLIFY_AUTH_TOKEN || process.env.NETLIFY_ACCESS_TOKEN;
if (!accessToken) {
    console.error('Error: NETLIFY_AUTH_TOKEN environment variable is required');
    console.error('Get your access token from: https://app.netlify.com/user/applications');
    process.exit(1);
}
const server = new NetlifyMCPServer({ accessToken });
server.run().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
});
//# sourceMappingURL=index.js.map