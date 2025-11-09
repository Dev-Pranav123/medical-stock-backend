# Use official Node.js LTS image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json first (for caching dependencies)
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy all other source code
COPY . .

# Expose the port your app runs on
EXPOSE 8080

# Set environment variable for production
ENV NODE_ENV=production

# Command to start your app
CMD ["node", "app.js"]
