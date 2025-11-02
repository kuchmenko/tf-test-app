# TF API

A TypeScript REST API for user management with PostgreSQL database. Built with Bun, Hono, and Kysely for type-safe database operations.

## Getting started

### Prerequisites

- [Bun](https://bun.sh/) v1.2.15 or higher
- [Docker](https://www.docker.com/) and Docker Compose

### Installation

```bash
# Install dependencies
bun install
```

### Development environment

```bash
# Start PostgreSQL database and API server
docker-compose up

# API will be available at http://localhost:3001
```

### Running tests

```bash
# Run integration tests (starts test database in Docker)
bun run test
```

### Available commands

```bash
# Development
bun run dev          # Start development server with hot reload

# Build
bun run build        # Build all packages

# Quality checks
bun run typecheck    # Run TypeScript type checking
bun run lint         # Run ESLint
bun run lint:fix     # Fix ESLint issues
bun run format       # Check code formatting
bun run format:fix   # Fix code formatting
```

## Development roadmap

Table below lists the items on the way towards being able to deploy, further develop and maintain this REST Api in production. Tasks are ordered according to their priority with **the topmost row being the next item the team picks for development**.

| Item                                     | Rationale                                                                                  |
| ---------------------------------------- | ------------------------------------------------------------------------------------------ |
| Add API authorization                    | This API deals with users and their email addresses and therefore needs to be protected.   |
| Add test coverage reporting              | Developers should have a convenient way to find blind spots in their test automation.      |
| Add load testing with k6                 | Validate API can handle expected traffic and identify performance bottlenecks before production deployment. |
| Add rate limiting                        | Protect API from abuse and ensure fair usage for all consumers in public cloud deployment. |
| Add error monitoring & logging           | Production-grade observability for debugging issues and incident response.                 |
| Add CI/CD pipeline                       | Automate testing and deployment process to ensure code quality and reduce manual errors.   |
| Add API documentation                    | OpenAPI/Swagger specification for API consumers to understand endpoints and contracts.     |
| Add health check endpoints               | Monitor service availability and database connectivity for uptime tracking.                |
| Add database backup & migration strategy | Ensure data reliability and safe schema evolution for production environment.              |

## Project structure

```
apps/
  api/                  # REST API server
    src/
      index.ts          # Main application entry point
      users.ts          # User management endpoints
      utils/            # Utilities (env validation, constants)
    package.json

packages/
  db/                   # Database layer
    src/
      index.ts          # Kysely instance and exports
      migrator.ts       # Migration runner
      migrations/       # SQL migrations
    package.json

docker-compose.yml      # Development environment
docker-compose.test.yaml # Test environment
```

## API endpoints

### Users

- `GET /users` - Get all users
- `POST /users` - Create a new user
  - Request body: `{ "email": "user@example.com" }`
  - Returns `409 Conflict` if email already exists

## Tech stack

- **Runtime**: Bun 1.2.15
- **Framework**: Hono (lightweight web framework)
- **Database**: PostgreSQL 16
- **Query builder**: Kysely (type-safe SQL)
- **Validation**: Arktype (runtime type validation)
- **Testing**: Bun test with integration tests
- **Monorepo**: Turborepo
