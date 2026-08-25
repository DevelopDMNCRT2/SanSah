FROM node:20-alpine

# Install openssl for Prisma compatibility
RUN apk add --no-cache openssl

WORKDIR /app

# Copy dependency specifications
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Expose default backend port
EXPOSE 3000

CMD ["node", "server.js"]
