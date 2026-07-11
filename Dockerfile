FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package.json ./
RUN npm install --production

# Copy source
COPY src/ ./src/
COPY .env.example ./

# Start Maganu
EXPOSE 3000
CMD ["node", "src/server.js"]
