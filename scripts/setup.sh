#!/bin/bash

echo "🚀 Setting up Auction System Development Environment"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build shared package first
echo "🔨 Building shared package..."
cd packages/shared && npm run build && cd ../..

# Install workspace dependencies
echo "📦 Installing workspace dependencies..."
npm install --workspaces

# Run type checking
echo "🔍 Running type checks..."
npm run type-check

# Run linting
echo "🧹 Running linter..."
npm run lint

# Format code
echo "💅 Formatting code..."
npm run format

echo "✅ Setup complete!"
echo ""
echo "🎯 Next steps:"
echo "1. Copy .env.example to .env and configure your environment variables"
echo "2. Start infrastructure: npm run docker:up"
echo "3. Seed database: npm run seed"
echo "4. Start API server: npm run dev:api"
echo "5. Start worker: npm run dev:worker"
echo ""
echo "📚 Available commands:"
echo "  npm run dev:api      - Start API server in development mode"
echo "  npm run dev:worker   - Start worker in development mode"
echo "  npm run build        - Build all packages"
echo "  npm run lint         - Run ESLint"
echo "  npm run format       - Format code with Prettier"
echo "  npm run type-check   - Run TypeScript type checking"
echo "  npm run docker:up    - Start infrastructure (Redis, PostgreSQL)"
echo "  npm run docker:down  - Stop infrastructure"
echo ""
echo "🔧 Architecture:"
echo "  - API server handles HTTP requests and Socket.io connections"
echo "  - Worker processes background jobs using Redis queues"
echo "  - Redis handles atomic bid operations and job queues"
echo "  - PostgreSQL stores persistent auction data"