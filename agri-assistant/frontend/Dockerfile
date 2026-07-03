# Stage 1: Build the React application
FROM node:18-alpine AS build

WORKDIR /app

# Copy dependency files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy codebase
COPY . .

# Expose build-time argument for custom backend API URL
ARG REACT_APP_API_URL
ENV REACT_APP_API_URL=$REACT_APP_API_URL

# Build the React application for production
RUN npm run build

# Stage 2: Serve the React application using Nginx
FROM nginx:1.25-alpine

# Copy built assets from Stage 1
COPY --from=build /app/build /usr/share/nginx/html

# Copy custom Nginx configuration to support SPA routing (React Router)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
