# DevFlow Automation Agent with Claude Computer Use
# Ubuntu base for full desktop automation capabilities

FROM ubuntu:22.04

# Prevent interactive prompts during installation
ENV DEBIAN_FRONTEND=noninteractive

# Install system dependencies
RUN apt-get update && apt-get install -y \
    # Core utilities
    curl \
    wget \
    git \
    ca-certificates \
    # Virtual display and desktop
    xvfb \
    x11vnc \
    fluxbox \
    xdotool \
    scrot \
    imagemagick \
    # Browser
    chromium-browser \
    # Node.js 20
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    # Cleanup
    && rm -rf /var/lib/apt/lists/*

# Install global CLI tools
RUN npm install -g \
    gh \
    vercel \
    stripe \
    && npm cache clean --force

# Create application directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install Node.js dependencies
RUN npm ci --only=production && npm cache clean --force

# Create non-root user with specific UID
RUN useradd -m -u 1000 -s /bin/bash agent && \
    # Create necessary directories
    mkdir -p /workspace /var/log/devflow /home/agent/.config && \
    # Set permissions
    chown -R agent:agent /app /workspace /var/log/devflow /home/agent

# Copy application code
COPY --chown=agent:agent . .

# Make start script executable
RUN chmod +x /app/start.sh

# Switch to non-root user
USER agent

# Set working directory
WORKDIR /workspace

# Environment variables
ENV DISPLAY=:99 \
    NODE_ENV=production \
    HOME=/home/agent

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD node /app/healthcheck.js || exit 1

# Start Xvfb and agent
CMD ["/app/start.sh"]
