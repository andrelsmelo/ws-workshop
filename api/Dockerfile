# Define the base image for the container
FROM node:20-alpine AS builder

# Set working directory within the container
WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the application code
COPY . .

# Switch to a slimmer runtime image for the final container
FROM node:lts-alpine

# Copy only the production-ready application files
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder . .

# Expose the port where the API listens
EXPOSE 8085

# Start the application using the appropriate command
CMD [ "npm", "start" ]

