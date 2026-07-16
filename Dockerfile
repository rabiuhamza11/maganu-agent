FROM node:20-slim

WORKDIR /app

# Install dependencies (Baileys needs some native build tools)
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 make g++ && \
    rm -rf /var/lib/apt/lists/*

# Install dependencies
COPY package.json ./
RUN npm install --production

# Copy source
COPY src/ ./src/
COPY .env.example ./

# Create auth directory for Baileys
RUN mkdir -p /app/auth_baileys

# Start Maganu
EXPOSE 3000
CMD ["node", "src/server.js"]
