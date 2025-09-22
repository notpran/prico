#!/bin/bash

# Prico Setup Verification Script
# Run this after following the setup guide to verify everything is working

echo "🔍 Verifying Prico Setup..."
echo "================================"

# Check if Node.js is installed
echo "📦 Checking Node.js..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo "✅ Node.js installed: $NODE_VERSION"
else
    echo "❌ Node.js not found. Please install Node.js 18+"
    exit 1
fi

# Check if Docker is installed
echo "🐳 Checking Docker..."
if command -v docker &> /dev/null; then
    DOCKER_VERSION=$(docker --version)
    echo "✅ Docker installed: $DOCKER_VERSION"
else
    echo "❌ Docker not found. Please install Docker"
    exit 1
fi

# Check if Docker Compose is installed
echo "🐳 Checking Docker Compose..."
if command -v docker-compose &> /dev/null; then
    COMPOSE_VERSION=$(docker-compose --version)
    echo "✅ Docker Compose installed: $COMPOSE_VERSION"
else
    echo "❌ Docker Compose not found. Please install Docker Compose"
    exit 1
fi

# Check if .env file exists
echo "⚙️  Checking environment configuration..."
if [ -f ".env" ]; then
    echo "✅ .env file exists"
else
    echo "❌ .env file not found. Please copy .env.example to .env and configure it"
    exit 1
fi

# Check if dependencies are installed
echo "📦 Checking dependencies..."
if [ -d "node_modules" ]; then
    echo "✅ Node modules installed"
else
    echo "❌ Node modules not found. Run 'npm install'"
    exit 1
fi

# Check if Docker services are running
echo "🐳 Checking Docker services..."
if docker-compose ps | grep -q "Up"; then
    echo "✅ Docker services are running"
    echo "   Services:"
    docker-compose ps --services --filter "status=running"
else
    echo "⚠️  Docker services not running. Run 'docker-compose up -d'"
fi

# Check if ports are available
echo "🔌 Checking port availability..."
PORTS=(3000 3001 1234 27017 6379)
for port in "${PORTS[@]}"; do
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null; then
        echo "✅ Port $port is in use (expected)"
    else
        echo "⚠️  Port $port is free"
    fi
done

# Test API endpoints
echo "🌐 Testing API endpoints..."
if curl -s http://localhost:3000/api/health > /dev/null 2>&1; then
    echo "✅ Frontend health check passed"
else
    echo "❌ Frontend not responding. Make sure 'npm run dev' is running"
fi

echo ""
echo "🎉 Setup verification complete!"
echo "================================"
echo "If you see any ❌ errors above, please fix them before proceeding."
echo "For help, check the SETUP.md file or run: npm run dev"</content>
<parameter name="filePath">/workspaces/prico/verify-setup.sh