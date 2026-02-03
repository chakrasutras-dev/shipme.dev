# DevFlow Automation Engine - Hardened Docker Container for Claude Computer Use

FROM node:20-alpine

# Install system dependencies for browser automation
RUN apk add --no-cache \
    chromium \
    xvfb \
    git \
    curl \
    bash

# Install CLI tools for automation
RUN npm install -g \
    @anthropic-ai/sdk \
    gh \
    vercel \
    @supabase/supabase-js

# Create non-root user for security
RUN addgroup -g 1000 agent && \
    adduser -D -u 1000 -G agent agent

# Create workspace
WORKDIR /workspace
RUN chown agent:agent /workspace

# Copy package files
COPY package*.json ./
RUN npm install

# Copy source code
COPY --chown=agent:agent . .

# Switch to non-root user
USER agent

# Environment variables
ENV DISPLAY=:99
ENV CHROME_BIN=/usr/bin/chromium-browser

# Entry point
CMD ["node", "index.js"]
