# Base image for building the application
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the Next.js application code
COPY . .

# Build the Next.js application for production (adjust if needed)
RUN npm run build

# Switch to a slimmer runtime image
FROM node:lts-alpine

# Coserverpy only the production-ready files
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./next

# Expose the port where Next.js serves the app
EXPOSE 3035

# Start the Next.js app in production mode
CMD [ "npm", "start" ]
