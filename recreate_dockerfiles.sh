#!/bin/bash

# Recreate frontend Dockerfile
cat > /workspaces/prico/frontend/Dockerfile << 'EOF'
FROM node:18-alpine

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy the rest of the application
COPY . .

# Expose the port
EXPOSE 3000

# Run the application in development mode
CMD ["npm", "run", "dev"]
EOF

# Recreate backend Dockerfile
cat > /workspaces/prico/backend/Dockerfile << 'EOF'
FROM python:3.9-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose the port
EXPOSE 8000

# Run the application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
EOF

# Create a .env file with the Clerk keys
cat > /workspaces/prico/.env << 'EOF'
# MongoDB
MONGO_USERNAME=admin
MONGO_PASSWORD=password
MONGODB_URL=mongodb://admin:password@mongodb:27017/
DB_NAME=prico_db

# Clerk Authentication
CLERK_SECRET_KEY=sk_test_wJNih3IuSH4pP97CTzJM2NIvmp1QNotKSWNlVdRvJF
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_cGxlYXNlZC1kb2Jlcm1hbi0xNy5jbGVyay5hY2NvdW50cy5kZXYk

# Environment
NODE_ENV=development
EOF

echo "Dockerfiles and .env file recreated!"