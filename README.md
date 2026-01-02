# Real-Time Auction System

A high-performance real-time auction platform built with Node.js, TypeScript, Express, Socket.io, Redis, and PostgreSQL.

## 🏗️ Architecture

```
├── apps/
│   ├── api/                     # Express + Socket.io API server
│   └── worker/                  # Background job processor
├── packages/
│   └── shared/                  # Shared types & constants
├── infra/                       # Infrastructure & Docker configs
└── scripts/                     # Development & deployment scripts
```

## ✨ Features

- **Real-time bidding** with Socket.io
- **Atomic bid processing** using Redis Lua scripts
- **Background job processing** using Redis (Streams / Lists)
- **Type-safe** development with TypeScript
- **Scalable architecture** with separate API and worker processes
- **Docker-ready** infrastructure setup

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Docker & Docker Compose
- Git

### Setup

1. **Clone and setup the project:**

   ```bash
   git clone <repository-url>
   cd auction-system
   chmod +x scripts/setup.sh
   ./scripts/setup.sh
   ```

2. **Configure environment:**

   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start infrastructure:**

   ```bash
   npm run docker:up
   ```

4. **Seed the database:**

   ```bash
   npm run seed
   ```

5. **Start the development servers:**

   ```bash
   # Terminal 1: API Server
   npm run dev:api

   # Terminal 2: Worker Process
   npm run dev:worker
   ```

## 📋 Available Scripts

### Root Level

- `npm run dev:api` - Start API server in development mode
- `npm run dev:worker` - Start worker in development mode
- `npm run build` - Build all packages
- `npm run lint` - Run ESLint on all packages
- `npm run format` - Format code with Prettier
- `npm run type-check` - Run TypeScript type checking
- `npm run docker:up` - Start infrastructure services
- `npm run docker:down` - Stop infrastructure services
- `npm run seed` - Seed database with sample data
- `npm run load-test` - Run load testing

### Individual Packages

Each package has its own scripts for development:

- `npm run build` - Build the package
- `npm run dev` - Start in development mode
- `npm run lint` - Lint the package
- `npm run format` - Format the package

## 🛠️ Development

### Code Quality

The project uses:

- **ESLint** for code linting
- **Prettier** for code formatting
- **Husky** for git hooks
- **TypeScript** for type safety

Pre-commit hooks automatically run linting and type checking.

### Project Structure

```
apps/api/src/
├── config/          # Configuration files
├── routes/          # Express route handlers
├── services/        # Business logic
├── sockets/         # Socket.io event handlers
├── redis/           # Redis utilities and Lua scripts
├── middlewares/     # Express middlewares
└── types/           # Type definitions

apps/worker/src/
├── jobs/            # Background job processors
├── config/          # Configuration files
└── services/        # Worker services

packages/shared/src/
├── types/           # Shared TypeScript types
├── constants.ts     # Shared constants
└── events.ts        # Socket.io event definitions
```

### Key Technologies

- **Express.js** - Web framework
- **Socket.io** - Real-time communication
- **Redis** - live auction state, atomic operations, and async coordination
- **PostgreSQL** - Primary database
- **TypeScript** - Type safety
- **Docker** - Containerization

## 🔧 Configuration

### Environment Variables

Copy `.env.example` to `.env` and configure:

```env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://auction_user:auction_pass@localhost:5432/auction_db
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-super-secret-jwt-key
```

### Database Schema

The system uses PostgreSQL with the following main tables:

- `users` - User accounts
- `items` - Auction items
- `auctions` - Auction details
- `bids` - Bid history

## 🚀 Deployment

### Docker Deployment

```bash
# Build and start all services
cd infra
docker-compose up -d

# Check logs
docker-compose logs -f api
docker-compose logs -f worker
```

### Production Considerations

- Set strong `JWT_SECRET`
- Configure proper database credentials
- Set up Redis persistence
- Configure reverse proxy (Nginx included)
- Set up monitoring and logging
- Configure SSL/TLS certificates

## 🧪 Testing

### Load Testing

Run load tests to verify system performance:

```bash
npm run load-test
```

This simulates multiple concurrent users placing bids.

## 📊 Monitoring

The system includes:

- Health check endpoints (`/health`)
- Structured logging
- Redis monitoring
- Database connection monitoring

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📄 License

ISC License
