# Base image
FROM node:lts-alpine

# Set working directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy entire project
COPY . .

# Build frontend and backend
RUN npm run build

# Expose port
EXPOSE 3000

# Run server
CMD ["npm", "start"]
