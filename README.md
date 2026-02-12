> This project is a personal initiative focused on learning on DevSecOps work.

# marquis_devsecops_platform
*A production-grade full-stack application demonstrating modern DevSecOps practices, microservices architecture, and secure real-time communication.*

---

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Implementation Roadmap](#implementation-roadmap)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Security Considerations](#security-considerations)
- [Monitoring & Observability](#monitoring--observability)
- [CI/CD Pipeline](#cicd-pipeline)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

---

## 🎯 Overview

### Project Goals

This project serves as a comprehensive demonstration of:
- **DevSecOps best practices** with security integrated at every layer
- **Microservices architecture** with proper service boundaries
- **Real-time communication** using WebSockets
- **Production-grade monitoring** with custom metrics and alerting
- **Complete CI/CD pipeline** with automated security scanning

### Core Features

- ✅ User authentication (Email/Password + Google OAuth 2.0)
- ✅ User directory with real-time online/offline status
- ✅ WebSocket-based chat with notifications
- ✅ Public REST/GraphQL API
- ✅ Comprehensive monitoring and logging
- ✅ Automated backups and disaster recovery

### Why This Stack?

This isn't just another CRUD app. Every technology choice serves a specific purpose in demonstrating professional-grade development practices while maintaining reasonable complexity for a solo portfolio project.

---

## 🏗️ Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Client Layer                        │
│                  (Next.js 14 + React 18)                    │
└────────────────────────┬────────────────────────────────────┘
                         │
                    ┌────▼────┐
                    │  NGINX  │ (Reverse Proxy + ModSecurity)
                    └────┬────┘
                         │
        ┌────────────────┼────────────────┐
        │                │                │
   ┌────▼────┐      ┌────▼────┐      ┌────▼────┐
   │  Auth   │      │  User   │      │  Chat   │
   │ Service │      │ Service │      │ Service │
   └────┬────┘      └────┬────┘      └────┬────┘
        │                │                │
        └────────────────┼────────────────┘
                         │
                   ┌─────▼──────┐
                   │ PostgreSQL │
                   └────────────┘

Observability Stack:
┌──────────┐  ┌──────────┐  ┌──────────┐
│Prometheus│  │   ELK    │  │  Vault   │
│ +Grafana │  │  Stack   │  │          │
└──────────┘  └──────────┘  └──────────┘
```

### Service Boundaries

Each microservice has a single, well-defined responsibility:

| Service | Responsibility | Port | Database |
|---------|---------------|------|----------|
| **auth-service** | Authentication, session management, OAuth | 3001 | Shared |
| **user-service** | User CRUD, profiles, search/filtering | 3002 | Shared |
| **chat-service** | WebSocket connections, message routing | 3003 | Shared |
| **notification-service** | Real-time notifications, push events | 3004 | Shared |
| **api-gateway** | Request routing, rate limiting, aggregation | 3000 | - |

*Note: Using a shared database is acceptable for this scale. In production microservices, you'd typically use separate databases per service (Database per Service pattern).*

---

## 🛠️ Tech Stack

### Backend Technologies

#### **NestJS** - Application Framework
**Why?**
- Built-in TypeScript support with excellent typing
- Modular architecture perfect for microservices
- Native support for WebSockets, GraphQL, and REST
- Dependency injection similar to Spring/Angular
- Extensive documentation and active community

**Alternatives Considered:**
- Express.js (too bare-bones, requires more boilerplate)
- Fastify (excellent performance, but smaller ecosystem)
- Koa.js (too minimalist for this use case)

#### **Prisma** - ORM
**Why?**
- Type-safe database client generated from schema
- Excellent migration system
- Auto-completion and IntelliSense
- Works seamlessly with PostgreSQL advanced features
- Built-in connection pooling

**Common Pitfalls:**
- ⚠️ N+1 query problems - Use `include` carefully, monitor with Prometheus
- ⚠️ Large migrations - Test on production-like data volumes
- ⚠️ Schema drift - Always use migrations, never modify DB directly

**Alternatives Considered:**
- TypeORM (less type-safe, can be buggy)
- Sequelize (older, less modern DX)
- Knex.js (too low-level for this project)

#### **Socket.io** - WebSocket Library
**Why?**
- Automatic reconnection and buffering
- Room/namespace support for chat channels
- Fallback to HTTP long-polling
- Built-in Redis adapter for horizontal scaling

**Common Pitfalls:**
- ⚠️ Memory leaks from unhandled disconnects
- ⚠️ Authentication - Secure handshake is critical
- ⚠️ Scaling - Requires Redis adapter for multi-instance

#### **PostgreSQL** - Database
**Why?**
- ACID compliance for critical user data
- Excellent JSON/JSONB support for flexible schemas
- Advanced indexing (GIN, BRIN) for search features
- Native full-text search
- Battle-tested in production

**Configuration Highlights:**
```sql
-- Enable extensions we'll need
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- for fuzzy search
```

---

### Frontend Technologies

#### **Next.js 14** - React Framework
**Why?**
- App Router with React Server Components
- Built-in API routes for BFF pattern
- Excellent SEO with SSR/SSG
- Image optimization out of the box
- TypeScript support

**Common Pitfalls:**
- ⚠️ Client vs Server Components - Understand the boundary
- ⚠️ Over-fetching - Use React Suspense properly
- ⚠️ Hydration errors - Match server/client rendering

#### **NextAuth.js** - Authentication
**Why?**
- Native OAuth provider support (Google, GitHub, etc.)
- JWT and database session strategies
- CSRF protection built-in
- Automatic token refresh

**Implementation Notes:**
```typescript
// Key security config
callbacks: {
  async jwt({ token, user, account }) {
    // Don't expose sensitive data in JWT
    // Use database sessions for critical apps
  }
}
```

#### **Zustand** - State Management
**Why?**
- Minimal boilerplate compared to Redux
- No Provider wrapper needed
- Built-in DevTools support
- Excellent TypeScript inference

**Alternatives Considered:**
- Redux Toolkit (overkill for this scope)
- Jotai (too atomic for global state)
- Context API (re-render issues at scale)

#### **shadcn/ui + Tailwind CSS** - UI Framework
**Why?**
- Copy-paste components (you own the code)
- Radix UI primitives (accessible by default)
- Tailwind for utility-first styling
- No runtime CSS-in-JS overhead

---

### DevSecOps Stack

#### **Docker + Docker Compose** - Containerization
**Why?**
- Consistent environments (dev = prod)
- Easy local development setup
- Prerequisite for Kubernetes
- Excellent caching layers

**Best Practices:**
```dockerfile
# Multi-stage builds for smaller images
FROM node:20-alpine AS builder
# ...
FROM node:20-alpine AS runner
# Non-root user
USER node
```

**Common Pitfalls:**
- ⚠️ Large images - Use Alpine, multi-stage builds
- ⚠️ Secrets in layers - Use BuildKit secrets
- ⚠️ No health checks - Always add HEALTHCHECK

#### **ModSecurity + NGINX** - Web Application Firewall
**Why?**
- OWASP Core Rule Set (CRS) protection
- Blocks SQL injection, XSS, RCE attempts
- Request/response inspection
- Industry-standard WAF

**Configuration Strategy:**
```nginx
# Enable ModSecurity
modsecurity on;
modsecurity_rules_file /etc/modsecurity/modsecurity.conf;

# Custom rules for our API
SecRule REQUEST_URI "@rx ^/api/admin" \
    "id:1001,phase:1,deny,status:403,msg:'Admin API blocked'"
```

#### **HashiCorp Vault** - Secrets Management
**Why?**
- Dynamic secrets generation
- Encryption as a service
- Audit logging of secret access
- Lease management and rotation

**Implementation:**
```bash
# Development mode (NOT for production)
vault server -dev

# Production: Use Raft storage backend
vault server -config=/vault/config/vault.hcl
```

**Common Pitfalls:**
- ⚠️ Token sprawl - Use short TTLs, auto-renewal
- ⚠️ Seal key management - Document recovery procedures
- ⚠️ Role policies - Principle of least privilege

#### **Prometheus + Grafana** - Monitoring
**Why?**
- Pull-based metrics (service discovery)
- PromQL for powerful queries
- Built-in alerting (Alertmanager)
- Grafana for visualization

**Custom Metrics to Track:**
```typescript
// Business metrics
const activeUsers = new Gauge({
  name: 'active_users_total',
  help: 'Currently active users'
});

const chatMessages = new Counter({
  name: 'chat_messages_total',
  help: 'Total chat messages sent',
  labelNames: ['room']
});

// Technical metrics
const dbQueryDuration = new Histogram({
  name: 'db_query_duration_seconds',
  help: 'Database query duration',
  buckets: [0.1, 0.5, 1, 2, 5]
});
```

**Alert Examples:**
- High error rate (> 5% for 5 minutes)
- Database connection pool exhaustion
- Disk space < 10%
- Certificate expiration < 7 days

#### **ELK Stack** - Centralized Logging
**Why?**
- Elasticsearch for log storage/search
- Logstash for log transformation
- Kibana for log visualization
- Scales horizontally

**Log Structure (JSON):**
```json
{
  "timestamp": "2025-02-11T10:30:00Z",
  "level": "info",
  "service": "chat-service",
  "trace_id": "abc123",
  "user_id": "user_456",
  "message": "Message sent",
  "metadata": {
    "room_id": "room_789",
    "message_length": 42
  }
}
```

**Common Pitfalls:**
- ⚠️ Log volume - Set retention policies
- ⚠️ PII in logs - Sanitize sensitive data
- ⚠️ Indexing cost - Use data streams, ILM policies

---

## 📅 Implementation Roadmap

### Phase 1: Foundation & Security Baseline (Weeks 1-3)

**Goal:** Establish secure infrastructure before writing business logic.

---

#### 1.1 Repository & Code Quality Setup

**Why This First?**
Security and quality must be enforced from commit #1. Setting this up later means technical debt.

**Steps:**
1. Initialize Git repository
   ```bash
   git init
   git checkout -b main
   ```

2. Install Husky + Commitlint
   ```bash
   npm install --save-dev husky @commitlint/{cli,config-conventional}
   npx husky install
   npx husky add .husky/commit-msg 'npx --no -- commitlint --edit $1'
   ```

3. Configure conventional commits
   ```js
   // commitlint.config.js
   module.exports = {
     extends: ['@commitlint/config-conventional'],
     rules: {
       'type-enum': [2, 'always', [
         'feat', 'fix', 'docs', 'style', 'refactor', 
         'perf', 'test', 'chore', 'ci', 'sec'
       ]]
     }
   };
   ```

4. Setup ESLint + Prettier
   ```bash
   npm install --save-dev eslint prettier eslint-config-prettier
   ```

5. Add pre-commit hooks
   ```bash
   npx husky add .husky/pre-commit 'npm run lint && npm run format:check'
   ```

**Common Pitfalls:**
- ⚠️ Team doesn't follow conventions - Enforce with CI, block merges
- ⚠️ Overly strict rules - Start permissive, tighten gradually
- ⚠️ Slow pre-commit hooks - Use lint-staged for changed files only

**Success Criteria:**
- [ ] All commits follow conventional format
- [ ] Pre-commit hooks prevent bad code
- [ ] CI fails on lint errors

---

#### 1.2 Docker Infrastructure

**Why This First?**
Environment consistency prevents "works on my machine" issues. Sets up volume structure for data persistence.

**Steps:**
1. Create folder structure
   ```
   infrastructure/
   ├── docker/
   │   ├── docker-compose.yml
   │   ├── .env.example
   │   └── services/
   │       ├── postgres/
   │       │   ├── Dockerfile
   │       │   └── init.sql
   │       └── vault/
   │           ├── Dockerfile
   │           └── config.hcl
   ```

2. Create base `docker-compose.yml`
   ```yaml
   version: '3.9'
   
   services:
     postgres:
       image: postgres:16-alpine
       environment:
         POSTGRES_DB: ${DB_NAME}
         POSTGRES_USER: ${DB_USER}
         POSTGRES_PASSWORD_FILE: /run/secrets/db_password
       secrets:
         - db_password
       volumes:
         - postgres_data:/var/lib/postgresql/data
         - ./services/postgres/init.sql:/docker-entrypoint-initdb.d/init.sql
       healthcheck:
         test: ["CMD-SHELL", "pg_isready -U ${DB_USER}"]
         interval: 10s
         timeout: 5s
         retries: 5
   
     vault:
       image: hashicorp/vault:1.15
       cap_add:
         - IPC_LOCK
       environment:
         VAULT_DEV_ROOT_TOKEN_ID: ${VAULT_DEV_TOKEN}
       ports:
         - "8200:8200"
       volumes:
         - vault_data:/vault/data
   
   secrets:
     db_password:
       file: ./secrets/db_password.txt
   
   volumes:
     postgres_data:
     vault_data:
   ```

3. Create `.env.example`
   ```env
   # Database
   DB_NAME=devsecops_platform
   DB_USER=app_user
   # Don't commit actual passwords!
   
   # Vault (dev only)
   VAULT_DEV_TOKEN=dev-token-change-me
   ```

4. Setup secrets directory (gitignored)
   ```bash
   mkdir -p infrastructure/docker/secrets
   echo "your-secure-password" > infrastructure/docker/secrets/db_password.txt
   echo "secrets/" >> .gitignore
   ```

**Common Pitfalls:**
- ⚠️ Secrets in `.env` committed - Use `.env.example`, gitignore `.env`
- ⚠️ No health checks - Services start before ready, causing failures
- ⚠️ Volume permission issues - Use named volumes, not bind mounts for data
- ⚠️ Container networking - Understand bridge vs host vs overlay

**Success Criteria:**
- [ ] `docker-compose up` starts all services
- [ ] PostgreSQL accessible on localhost:5432
- [ ] Vault UI accessible on localhost:8200
- [ ] Data persists after `docker-compose down`

---

#### 1.3 Vault Secret Management

**Why Before App Code?**
Never hardcode secrets. Establish the pattern from day one.

**Steps:**
1. Initialize Vault (dev mode)
   ```bash
   docker-compose up vault
   export VAULT_ADDR='http://127.0.0.1:8200'
   export VAULT_TOKEN='dev-token-change-me'
   vault status
   ```

2. Enable KV secrets engine
   ```bash
   vault secrets enable -path=secret kv-v2
   ```

3. Store database credentials
   ```bash
   vault kv put secret/database \
     username=app_user \
     password=your-secure-password
   ```

4. Create policy for app services
   ```bash
   vault policy write app-policy - <<EOF
   path "secret/data/database" {
     capabilities = ["read"]
   }
   
   path "secret/data/jwt" {
     capabilities = ["read"]
   }
   EOF
   ```

5. Generate app token
   ```bash
   vault token create -policy=app-policy -ttl=24h
   # Save this token for services
   ```

6. Test secret retrieval
   ```bash
   vault kv get secret/database
   ```

**Common Pitfalls:**
- ⚠️ Root token in production - Use proper auth methods (AppRole, Kubernetes)
- ⚠️ Long-lived tokens - Set TTL, implement auto-renewal
- ⚠️ No audit logging - Enable audit backend in production
- ⚠️ Vault sealed on restart - Document unseal process

**Success Criteria:**
- [ ] Secrets stored in Vault, not environment variables
- [ ] Policy restricts access to needed secrets only
- [ ] Token has reasonable TTL

---

#### 1.4 PostgreSQL + Prisma Setup

**Why This Order?**
Database schema drives API design. Define data model before services.

**Steps:**
1. Initialize Prisma in a workspace
   ```bash
   mkdir -p services/shared/prisma
   cd services/shared
   npm init -y
   npm install prisma @prisma/client
   npx prisma init
   ```

2. Define schema (`prisma/schema.prisma`)
   ```prisma
   generator client {
     provider = "prisma-client-js"
   }
   
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   
   model User {
     id            String    @id @default(uuid())
     email         String    @unique
     username      String    @unique
     passwordHash  String?
     googleId      String?   @unique
     avatarUrl     String?
     isOnline      Boolean   @default(false)
     lastSeenAt    DateTime?
     createdAt     DateTime  @default(now())
     updatedAt     DateTime  @updatedAt
     
     sentMessages      Message[] @relation("SentMessages")
     receivedMessages  Message[] @relation("ReceivedMessages")
     
     @@index([email])
     @@index([username])
     @@index([isOnline])
   }
   
   model Message {
     id         String   @id @default(uuid())
     content    String
     createdAt  DateTime @default(now())
     
     senderId   String
     sender     User     @relation("SentMessages", fields: [senderId], references: [id])
     
     receiverId String
     receiver   User     @relation("ReceivedMessages", fields: [receiverId], references: [id])
     
     @@index([senderId])
     @@index([receiverId])
     @@index([createdAt])
   }
   ```

3. Setup environment
   ```bash
   # .env (gitignored)
   DATABASE_URL="postgresql://app_user:password@localhost:5432/devsecops_platform"
   ```

4. Create and run migration
   ```bash
   npx prisma migrate dev --name init
   ```

5. Generate Prisma Client
   ```bash
   npx prisma generate
   ```

6. Create seed script (`prisma/seed.ts`)
   ```typescript
   import { PrismaClient } from '@prisma/client';
   import * as bcrypt from 'bcryptjs';
   
   const prisma = new PrismaClient();
   
   async function main() {
     const users = await Promise.all([
       prisma.user.upsert({
         where: { email: 'alice@example.com' },
         update: {},
         create: {
           email: 'alice@example.com',
           username: 'alice',
           passwordHash: await bcrypt.hash('password123', 10),
           isOnline: true,
         },
       }),
       prisma.user.upsert({
         where: { email: 'bob@example.com' },
         update: {},
         create: {
           email: 'bob@example.com',
           username: 'bob',
           passwordHash: await bcrypt.hash('password123', 10),
           isOnline: false,
         },
       }),
     ]);
   
     console.log({ users });
   }
   
   main()
     .catch((e) => {
       console.error(e);
       process.exit(1);
     })
     .finally(async () => {
       await prisma.$disconnect();
     });
   ```

7. Run seed
   ```bash
   npx prisma db seed
   ```

**Common Pitfalls:**
- ⚠️ Missing indexes - Always index foreign keys and search fields
- ⚠️ N+1 queries - Use `include` with caution, consider `select`
- ⚠️ Migration rollback - Test migrations on staging data first
- ⚠️ Connection pool exhaustion - Configure `connection_limit` in URL

**Success Criteria:**
- [ ] Database schema matches business requirements
- [ ] Migrations run successfully
- [ ] Seed data creates test users
- [ ] Prisma Studio shows data (`npx prisma studio`)

---

### Phase 2: Core Backend Services (Weeks 4-5)

---

#### 2.1 NestJS Project Setup

**Why This Structure?**
Monorepo with shared libraries prevents code duplication while maintaining service boundaries.

**Steps:**
1. Create NestJS monorepo
   ```bash
   npm i -g @nestjs/cli
   nest new services --package-manager npm
   cd services
   ```

2. Generate microservices
   ```bash
   nest generate app auth-service
   nest generate app user-service
   nest generate app chat-service
   nest generate app api-gateway
   ```

3. Create shared library
   ```bash
   nest generate library common
   ```

4. Configure `tsconfig.json` paths
   ```json
   {
     "compilerOptions": {
       "paths": {
         "@app/common": ["libs/common/src"],
         "@app/common/*": ["libs/common/src/*"]
       }
     }
   }
   ```

5. Setup shared Prisma module (`libs/common/src/prisma/`)
   ```typescript
   import { Module, Global } from '@nestjs/common';
   import { PrismaService } from './prisma.service';
   
   @Global()
   @Module({
     providers: [PrismaService],
     exports: [PrismaService],
   })
   export class PrismaModule {}
   ```

6. Create base config module
   ```typescript
   // libs/common/src/config/configuration.ts
   export default () => ({
     port: parseInt(process.env.PORT, 10) || 3000,
     database: {
       url: process.env.DATABASE_URL,
     },
     jwt: {
       secret: process.env.JWT_SECRET,
       expiresIn: '1d',
     },
     vault: {
       endpoint: process.env.VAULT_ADDR,
       token: process.env.VAULT_TOKEN,
     },
   });
   ```

**Common Pitfalls:**
- ⚠️ Circular dependencies - Use forwardRef() or restructure
- ⚠️ Shared state - Each service should be stateless
- ⚠️ Module imports - Don't import entire apps, use libraries

**Success Criteria:**
- [ ] All services compile without errors
- [ ] Shared Prisma client works across services
- [ ] Services can run independently

---

#### 2.2 Auth Service - OAuth + JWT

**Why OAuth + JWT?**
- OAuth: Delegated authentication (don't store Google passwords)
- JWT: Stateless auth tokens (scales horizontally)

**Steps:**
1. Install dependencies
   ```bash
   npm install @nestjs/passport passport passport-google-oauth20 \
     @nestjs/jwt passport-jwt bcryptjs
   ```

2. Create Google OAuth strategy
   ```typescript
   // apps/auth-service/src/strategies/google.strategy.ts
   import { Injectable } from '@nestjs/common';
   import { PassportStrategy } from '@nestjs/passport';
   import { Strategy, VerifyCallback } from 'passport-google-oauth20';
   import { ConfigService } from '@nestjs/config';
   
   @Injectable()
   export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
     constructor(private configService: ConfigService) {
       super({
         clientID: configService.get('GOOGLE_CLIENT_ID'),
         clientSecret: configService.get('GOOGLE_CLIENT_SECRET'),
         callbackURL: 'http://localhost:3001/auth/google/callback',
         scope: ['email', 'profile'],
       });
     }
   
     async validate(
       accessToken: string,
       refreshToken: string,
       profile: any,
       done: VerifyCallback,
     ): Promise<any> {
       const { id, emails, displayName, photos } = profile;
       const user = {
         googleId: id,
         email: emails[0].value,
         username: displayName,
         avatarUrl: photos[0].value,
       };
       done(null, user);
     }
   }
   ```

3. Create JWT strategy
   ```typescript
   // apps/auth-service/src/strategies/jwt.strategy.ts
   import { Injectable, UnauthorizedException } from '@nestjs/common';
   import { PassportStrategy } from '@nestjs/passport';
   import { ExtractJwt, Strategy } from 'passport-jwt';
   import { ConfigService } from '@nestjs/config';
   import { PrismaService } from '@app/common/prisma';
   
   @Injectable()
   export class JwtStrategy extends PassportStrategy(Strategy) {
     constructor(
       private configService: ConfigService,
       private prisma: PrismaService,
     ) {
       super({
         jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
         secretOrKey: configService.get('JWT_SECRET'),
       });
     }
   
     async validate(payload: { sub: string; email: string }) {
       const user = await this.prisma.user.findUnique({
         where: { id: payload.sub },
       });
   
       if (!user) {
         throw new UnauthorizedException();
       }
   
       return user;
     }
   }
   ```

4. Implement auth controller
   ```typescript
   // apps/auth-service/src/auth.controller.ts
   @Controller('auth')
   export class AuthController {
     constructor(private authService: AuthService) {}
   
     @Post('register')
     async register(@Body() dto: RegisterDto) {
       return this.authService.register(dto);
     }
   
     @Post('login')
     async login(@Body() dto: LoginDto) {
       return this.authService.login(dto);
     }
   
     @Get('google')
     @UseGuards(AuthGuard('google'))
     googleAuth() {}
   
     @Get('google/callback')
     @UseGuards(AuthGuard('google'))
     async googleAuthCallback(@Req() req, @Res() res) {
       const token = await this.authService.handleGoogleLogin(req.user);
       res.redirect(`http://localhost:3000/auth/success?token=${token}`);
     }
   }
   ```

5. Implement service logic
   ```typescript
   // apps/auth-service/src/auth.service.ts
   @Injectable()
   export class AuthService {
     constructor(
       private prisma: PrismaService,
       private jwtService: JwtService,
     ) {}
   
     async register(dto: RegisterDto) {
       const hashedPassword = await bcrypt.hash(dto.password, 10);
       
       const user = await this.prisma.user.create({
         data: {
           email: dto.email,
           username: dto.username,
           passwordHash: hashedPassword,
         },
       });
   
       return this.generateToken(user);
     }
   
     async login(dto: LoginDto) {
       const user = await this.prisma.user.findUnique({
         where: { email: dto.email },
       });
   
       if (!user || !await bcrypt.compare(dto.password, user.passwordHash)) {
         throw new UnauthorizedException('Invalid credentials');
       }
   
       return this.generateToken(user);
     }
   
     async handleGoogleLogin(profile: any) {
       let user = await this.prisma.user.findUnique({
         where: { googleId: profile.googleId },
       });
   
       if (!user) {
         user = await this.prisma.user.create({
           data: profile,
         });
       }
   
       return this.generateToken(user);
     }
   
     private generateToken(user: User) {
       return {
         access_token: this.jwtService.sign({
           sub: user.id,
           email: user.email,
         }),
       };
     }
   }
   ```

**Common Pitfalls:**
- ⚠️ JWT secret in code - Always use environment variables
- ⚠️ No token expiration - Set reasonable TTL (15min-1hour)
- ⚠️ Storing sensitive data in JWT - JWT is decoded, not encrypted
- ⚠️ Password validation - Enforce strong passwords (min length, complexity)
- ⚠️ Rate limiting - Add throttling to prevent brute force

**Security Checklist:**
- [ ] Passwords hashed with bcrypt (cost factor ≥ 10)
- [ ] JWT secret from Vault, not environment
- [ ] Token expiration set (1 hour max)
- [ ] HTTPS only in production
- [ ] Rate limiting on login endpoint (5 attempts/minute)

**Success Criteria:**
- [ ] User can register with email/password
- [ ] User can login and receive JWT
- [ ] Google OAuth flow completes
- [ ] JWT validates on subsequent requests

---

#### 2.3 User Service - CRUD & Search

**Why Separate Service?**
Auth and user management have different scaling characteristics. Auth is write-heavy, user search is read-heavy.

**Steps:**
1. Generate user module
   ```bash
   cd apps/user-service
   nest g module users
   nest g controller users
   nest g service users
   ```

2. Implement DTO with validation
   ```typescript
   // apps/user-service/src/dto/update-user.dto.ts
   import { IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';
   
   export class UpdateUserDto {
     @IsOptional()
     @IsString()
     @MaxLength(50)
     username?: string;
   
     @IsOptional()
     @IsUrl()
     avatarUrl?: string;
   }
   ```

3. Create users controller
   ```typescript
   // apps/user-service/src/users/users.controller.ts
   @Controller('users')
   export class UsersController {
     constructor(private usersService: UsersService) {}
   
     @Get()
     async findAll(@Query() query: FindUsersDto) {
       return this.usersService.findAll(query);
     }
   
     @Get(':id')
     async findOne(@Param('id') id: string) {
       return this.usersService.findOne(id);
     }
   
     @Patch(':id')
     @UseGuards(JwtAuthGuard)
     async update(
       @Param('id') id: string,
       @Body() dto: UpdateUserDto,
       @CurrentUser() user: User,
     ) {
       if (user.id !== id) {
         throw new ForbiddenException('Cannot update other users');
       }
       return this.usersService.update(id, dto);
     }
   }
   ```

4. Implement service with filtering
   ```typescript
   // apps/user-service/src/users/users.service.ts
   @Injectable()
   export class UsersService {
     constructor(private prisma: PrismaService) {}
   
     async findAll(query: FindUsersDto) {
       const { search, isOnline, limit = 20, offset = 0 } = query;
   
       const where: Prisma.UserWhereInput = {};
   
       if (search) {
         where.OR = [
           { username: { contains: search, mode: 'insensitive' } },
           { email: { contains: search, mode: 'insensitive' } },
         ];
       }
   
       if (isOnline !== undefined) {
         where.isOnline = isOnline;
       }
   
       const [users, total] = await Promise.all([
         this.prisma.user.findMany({
           where,
           take: limit,
           skip: offset,
           select: {
             id: true,
             username: true,
             avatarUrl: true,
             isOnline: true,
             lastSeenAt: true,
           },
         }),
         this.prisma.user.count({ where }),
       ]);
   
       return {
         data: users,
         meta: {
           total,
           limit,
           offset,
         },
       };
     }
   
     async findOne(id: string) {
       const user = await this.prisma.user.findUnique({
         where: { id },
         select: {
           id: true,
           username: true,
           email: true,
           avatarUrl: true,
           isOnline: true,
           lastSeenAt: true,
           createdAt: true,
         },
       });
   
       if (!user) {
         throw new NotFoundException('User not found');
       }
   
       return user;
     }
   
     async update(id: string, dto: UpdateUserDto) {
       return this.prisma.user.update({
         where: { id },
         data: dto,
       });
     }
   
     async updateOnlineStatus(id: string, isOnline: boolean) {
       return this.prisma.user.update({
         where: { id },
         data: {
           isOnline,
           lastSeenAt: new Date(),
         },
       });
     }
   }
   ```

5. Add pagination and filtering DTOs
   ```typescript
   // apps/user-service/src/dto/find-users.dto.ts
   import { IsOptional, IsBoolean, IsString, IsInt, Min, Max } from 'class-validator';
   import { Type } from 'class-transformer';
   
   export class FindUsersDto {
     @IsOptional()
     @IsString()
     search?: string;
   
     @IsOptional()
     @IsBoolean()
     @Type(() => Boolean)
     isOnline?: boolean;
   
     @IsOptional()
     @IsInt()
     @Min(1)
     @Max(100)
     @Type(() => Number)
     limit?: number = 20;
   
     @IsOptional()
     @IsInt()
     @Min(0)
     @Type(() => Number)
     offset?: number = 0;
   }
   ```

**Common Pitfalls:**
- ⚠️ No pagination - Always paginate lists (default limit: 20)
- ⚠️ Exposing passwords - Never return passwordHash in responses
- ⚠️ SQL injection - Prisma prevents this, but validate inputs anyway
- ⚠️ IDOR (Insecure Direct Object Reference) - Check user owns resource

**Performance Considerations:**
```typescript
// BAD: N+1 query
const users = await prisma.user.findMany();
for (const user of users) {
  user.messages = await prisma.message.findMany({ where: { senderId: user.id } });
}

// GOOD: Single query with include
const users = await prisma.user.findMany({
  include: {
    sentMessages: {
      take: 10,
      orderBy: { createdAt: 'desc' },
    },
  },
});
```

**Success Criteria:**
- [ ] Can fetch paginated user list
- [ ] Filtering by online status works
- [ ] Search by username/email works
- [ ] User can update their own profile only
- [ ] No sensitive data (passwords) in responses

---

#### 2.4 Chat Service - WebSockets

**Why Socket.io?**
- Automatic reconnection logic
- Room/namespace support for channels
- Fallback to long-polling if WebSocket fails

**Steps:**
1. Install dependencies
   ```bash
   npm install @nestjs/websockets @nestjs/platform-socket.io socket.io
   ```

2. Create chat gateway
   ```typescript
   // apps/chat-service/src/chat/chat.gateway.ts
   import {
     WebSocketGateway,
     WebSocketServer,
     SubscribeMessage,
     OnGatewayConnection,
     OnGatewayDisconnect,
     ConnectedSocket,
     MessageBody,
   } from '@nestjs/websockets';
   import { Server, Socket } from 'socket.io';
   import { UseGuards } from '@nestjs/common';
   import { WsJwtGuard } from './guards/ws-jwt.guard';
   
   @WebSocketGateway({
     cors: {
       origin: process.env.FRONTEND_URL,
       credentials: true,
     },
   })
   export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
     @WebSocketServer()
     server: Server;
   
     constructor(
       private chatService: ChatService,
       private usersService: UsersService,
     ) {}
   
     async handleConnection(client: Socket) {
       try {
         const user = await this.validateToken(client);
         client.data.user = user;
         
         // Update online status
         await this.usersService.updateOnlineStatus(user.id, true);
         
         // Notify others
         this.server.emit('user:online', { userId: user.id });
         
         console.log(`User connected: ${user.username} (${client.id})`);
       } catch (error) {
         client.disconnect();
       }
     }
   
     async handleDisconnect(client: Socket) {
       const user = client.data.user;
       if (user) {
         await this.usersService.updateOnlineStatus(user.id, false);
         this.server.emit('user:offline', { userId: user.id });
         console.log(`User disconnected: ${user.username}`);
       }
     }
   
     @UseGuards(WsJwtGuard)
     @SubscribeMessage('message:send')
     async handleMessage(
       @ConnectedSocket() client: Socket,
       @MessageBody() data: SendMessageDto,
     ) {
       const sender = client.data.user;
       
       // Save to database
       const message = await this.chatService.createMessage({
         senderId: sender.id,
         receiverId: data.receiverId,
         content: data.content,
       });
   
       // Emit to receiver
       this.server.emit(`message:${data.receiverId}`, {
         id: message.id,
         senderId: sender.id,
         senderUsername: sender.username,
         content: message.content,
         createdAt: message.createdAt,
       });
   
       return { success: true, messageId: message.id };
     }
   
     @UseGuards(WsJwtGuard)
     @SubscribeMessage('typing:start')
     handleTypingStart(
       @ConnectedSocket() client: Socket,
       @MessageBody() data: { receiverId: string },
     ) {
       this.server.emit(`typing:${data.receiverId}`, {
         userId: client.data.user.id,
         isTyping: true,
       });
     }
   
     @UseGuards(WsJwtGuard)
     @SubscribeMessage('typing:stop')
     handleTypingStop(
       @ConnectedSocket() client: Socket,
       @MessageBody() data: { receiverId: string },
     ) {
       this.server.emit(`typing:${data.receiverId}`, {
         userId: client.data.user.id,
         isTyping: false,
       });
     }
   
     private async validateToken(client: Socket): Promise<User> {
       const token = client.handshake.auth.token || client.handshake.headers.authorization;
       
       if (!token) {
         throw new UnauthorizedException('No token provided');
       }
       
       // Verify JWT and return user
       // Implementation depends on your auth setup
     }
   }
   ```

3. Create WebSocket JWT guard
   ```typescript
   // apps/chat-service/src/guards/ws-jwt.guard.ts
   import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
   import { JwtService } from '@nestjs/jwt';
   import { WsException } from '@nestjs/websockets';
   
   @Injectable()
   export class WsJwtGuard implements CanActivate {
     constructor(private jwtService: JwtService) {}
   
     canActivate(context: ExecutionContext): boolean {
       const client = context.switchToWs().getClient();
       const user = client.data.user;
       
       if (!user) {
         throw new WsException('Unauthorized');
       }
       
       return true;
     }
   }
   ```

4. Implement chat service
   ```typescript
   // apps/chat-service/src/chat/chat.service.ts
   @Injectable()
   export class ChatService {
     constructor(private prisma: PrismaService) {}
   
     async createMessage(data: CreateMessageDto) {
       return this.prisma.message.create({
         data,
         include: {
           sender: {
             select: {
               id: true,
               username: true,
               avatarUrl: true,
             },
           },
         },
       });
     }
   
     async getConversation(userId1: string, userId2: string, limit = 50) {
       return this.prisma.message.findMany({
         where: {
           OR: [
             { senderId: userId1, receiverId: userId2 },
             { senderId: userId2, receiverId: userId1 },
           ],
         },
         orderBy: { createdAt: 'desc' },
         take: limit,
         include: {
           sender: {
             select: {
               id: true,
               username: true,
               avatarUrl: true,
             },
           },
         },
       });
     }
   }
   ```

**Common Pitfalls:**
- ⚠️ No authentication - Anyone can connect without WS guard
- ⚠️ Memory leaks - Clean up event listeners on disconnect
- ⚠️ Broadcasting to all - Use rooms/namespaces for targeted events
- ⚠️ No message persistence - Always save messages to DB
- ⚠️ CORS issues - Configure CORS properly for WebSocket

**Security Considerations:**
```typescript
// BAD: Anyone can send as anyone
@SubscribeMessage('message:send')
handleMessage(@MessageBody() data: { senderId: string, ... }) {
  // Trusts client-provided senderId!
}

// GOOD: Use authenticated socket user
@SubscribeMessage('message:send')
handleMessage(@ConnectedSocket() client: Socket, @MessageBody() data) {
  const senderId = client.data.user.id; // From authenticated token
}
```

**Performance Optimization:**
```typescript
// Use Redis adapter for horizontal scaling
import { RedisIoAdapter } from '@your-app/redis-adapter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const redisIoAdapter = new RedisIoAdapter(app);
  await redisIoAdapter.connectToRedis();
  app.useWebSocketAdapter(redisIoAdapter);
}
```

**Success Criteria:**
- [ ] Users can connect with valid JWT
- [ ] Messages sent via WebSocket appear in DB
- [ ] Recipient receives message in real-time
- [ ] Typing indicators work
- [ ] Online/offline status updates broadcast
- [ ] Connection survives brief network interruptions

---

### Phase 3: Security Hardening (Week 6)

---

#### 3.1 ModSecurity WAF Configuration

**Why ModSecurity?**
Industry-standard WAF. Blocks OWASP Top 10 attacks (SQLi, XSS, etc.) at the edge.

**Steps:**
1. Create NGINX + ModSecurity Dockerfile
   ```dockerfile
   # infrastructure/docker/nginx/Dockerfile
   FROM nginx:1.25-alpine
   
   # Install ModSecurity
   RUN apk add --no-cache \
       modsecurity \
       modsecurity-nginx
   
   # Copy OWASP CRS
   COPY --from=owasp/modsecurity-crs:3.3 /usr/local/owasp-crs /etc/nginx/owasp-crs
   
   # Copy configs
   COPY nginx.conf /etc/nginx/nginx.conf
   COPY modsecurity.conf /etc/nginx/modsecurity/modsecurity.conf
   COPY crs-setup.conf /etc/nginx/modsecurity/crs-setup.conf
   
   EXPOSE 80 443
   CMD ["nginx", "-g", "daemon off;"]
   ```

2. Configure ModSecurity
   ```nginx
   # infrastructure/docker/nginx/modsecurity.conf
   SecRuleEngine On
   SecRequestBodyAccess On
   SecResponseBodyAccess Off
   
   # Allow up to 10MB request body
   SecRequestBodyLimit 10485760
   SecRequestBodyNoFilesLimit 131072
   
   # Log to stdout
   SecAuditEngine RelevantOnly
   SecAuditLog /dev/stdout
   SecAuditLogType Serial
   
   # Include OWASP CRS
   Include /etc/nginx/owasp-crs/crs-setup.conf
   Include /etc/nginx/owasp-crs/rules/*.conf
   ```

3. Setup NGINX reverse proxy
   ```nginx
   # infrastructure/docker/nginx/nginx.conf
   events {
       worker_connections 1024;
   }
   
   http {
       # ModSecurity
       modsecurity on;
       modsecurity_rules_file /etc/nginx/modsecurity/modsecurity.conf;
   
       # Rate limiting
       limit_req_zone $binary_remote_addr zone=auth_limit:10m rate=5r/m;
       limit_req_zone $binary_remote_addr zone=api_limit:10m rate=100r/m;
   
       upstream auth_service {
           server auth-service:3001;
       }
   
       upstream user_service {
           server user-service:3002;
       }
   
       upstream chat_service {
           server chat-service:3003;
       }
   
       server {
           listen 80;
           server_name localhost;
   
           # Redirect to HTTPS
           return 301 https://$server_name$request_uri;
       }
   
       server {
           listen 443 ssl http2;
           server_name localhost;
   
           ssl_certificate /etc/nginx/ssl/cert.pem;
           ssl_certificate_key /etc/nginx/ssl/key.pem;
           ssl_protocols TLSv1.2 TLSv1.3;
           ssl_ciphers HIGH:!aNULL:!MD5;
   
           # Security headers
           add_header X-Frame-Options "SAMEORIGIN" always;
           add_header X-Content-Type-Options "nosniff" always;
           add_header X-XSS-Protection "1; mode=block" always;
           add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
   
           # Auth endpoints (strict rate limit)
           location /api/auth {
               limit_req zone=auth_limit burst=10;
               proxy_pass http://auth_service;
               proxy_set_header Host $host;
               proxy_set_header X-Real-IP $remote_addr;
               proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           }
   
           # User API
           location /api/users {
               limit_req zone=api_limit burst=50;
               proxy_pass http://user_service;
           }
   
           # WebSocket (chat)
           location /socket.io {
               proxy_pass http://chat_service;
               proxy_http_version 1.1;
               proxy_set_header Upgrade $http_upgrade;
               proxy_set_header Connection "upgrade";
               proxy_set_header Host $host;
           }
       }
   }
   ```

4. Generate self-signed SSL certificates (dev)
   ```bash
   mkdir -p infrastructure/docker/nginx/ssl
   openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
     -keyout infrastructure/docker/nginx/ssl/key.pem \
     -out infrastructure/docker/nginx/ssl/cert.pem \
     -subj "/CN=localhost"
   ```

5. Add custom ModSecurity rules
   ```
   # infrastructure/docker/nginx/custom-rules.conf
   
   # Block admin endpoints from public
   SecRule REQUEST_URI "@rx ^/api/admin" \
       "id:1001,phase:1,deny,status:403,msg:'Admin endpoints forbidden'"
   
   # Block suspicious user agents
   SecRule REQUEST_HEADERS:User-Agent "@rx (sqlmap|nikto|nmap)" \
       "id:1002,phase:1,deny,status:403,msg:'Blocked scanner'"
   
   # Limit file upload size
   SecRule FILES_TMPNAMES "@rx ." \
       "id:1003,phase:2,t:none,deny,status:413,msg:'File too large',\
       chain"
   SecRule FILES_SIZES "@gt 5242880"
   ```

**Common Pitfalls:**
- ⚠️ Blocking legitimate traffic - Start in DetectionOnly mode, tune rules
- ⚠️ Performance impact - ModSecurity adds ~5-10ms latency
- ⚠️ False positives - Whitelist known-good patterns
- ⚠️ Log flooding - Set appropriate audit log level

**Testing:**
```bash
# Test SQL injection (should be blocked)
curl -X POST http://localhost/api/users \
  -d "username=admin' OR '1'='1"

# Check ModSecurity logs
docker logs nginx | grep ModSecurity
```

**Success Criteria:**
- [ ] All HTTP traffic redirects to HTTPS
- [ ] SQL injection attempts blocked
- [ ] XSS payloads blocked
- [ ] Rate limiting works (429 after limit)
- [ ] Security headers present in responses

---

### Phase 4: Observability Stack (Week 7-8)

---

#### 4.1 Prometheus Metrics

**Why Prometheus?**
- Pull-based (service discovery friendly)
- Powerful query language (PromQL)
- Battle-tested in production

**Steps:**
1. Install Prometheus client in services
   ```bash
   npm install prom-client
   ```

2. Create metrics module
   ```typescript
   // libs/common/src/metrics/metrics.module.ts
   import { Module } from '@nestjs/common';
   import { MetricsService } from './metrics.service';
   import { MetricsController } from './metrics.controller';
   
   @Module({
     providers: [MetricsService],
     controllers: [MetricsController],
     exports: [MetricsService],
   })
   export class MetricsModule {}
   ```

3. Setup metrics service
   ```typescript
   // libs/common/src/metrics/metrics.service.ts
   import { Injectable } from '@nestjs/common';
   import { Registry, Counter, Histogram, Gauge, collectDefaultMetrics } from 'prom-client';
   
   @Injectable()
   export class MetricsService {
     private readonly registry: Registry;
     
     public readonly httpRequestDuration: Histogram;
     public readonly httpRequestTotal: Counter;
     public readonly activeConnections: Gauge;
     public readonly dbQueryDuration: Histogram;
     
     // Business metrics
     public readonly activeUsers: Gauge;
     public readonly messagesSent: Counter;
     
     constructor() {
       this.registry = new Registry();
       
       // Collect default metrics (CPU, memory, etc.)
       collectDefaultMetrics({ register: this.registry });
       
       // HTTP metrics
       this.httpRequestDuration = new Histogram({
         name: 'http_request_duration_seconds',
         help: 'HTTP request duration',
         labelNames: ['method', 'route', 'status_code'],
         buckets: [0.1, 0.5, 1, 2, 5],
         registers: [this.registry],
       });
       
       this.httpRequestTotal = new Counter({
         name: 'http_requests_total',
         help: 'Total HTTP requests',
         labelNames: ['method', 'route', 'status_code'],
         registers: [this.registry],
       });
       
       // WebSocket metrics
       this.activeConnections = new Gauge({
         name: 'websocket_connections_active',
         help: 'Currently active WebSocket connections',
         registers: [this.registry],
       });
       
       // Database metrics
       this.dbQueryDuration = new Histogram({
         name: 'db_query_duration_seconds',
         help: 'Database query duration',
         labelNames: ['operation', 'model'],
         buckets: [0.01, 0.05, 0.1, 0.5, 1],
         registers: [this.registry],
       });
       
       // Business metrics
       this.activeUsers = new Gauge({
         name: 'active_users_total',
         help: 'Currently active users',
         registers: [this.registry],
       });
       
       this.messagesSent = new Counter({
         name: 'chat_messages_total',
         help: 'Total messages sent',
         labelNames: ['type'],
         registers: [this.registry],
       });
     }
     
     getMetrics(): Promise<string> {
       return this.registry.metrics();
     }
   }
   ```

4. Create metrics controller
   ```typescript
   // libs/common/src/metrics/metrics.controller.ts
   import { Controller, Get } from '@nestjs/common';
   import { MetricsService } from './metrics.service';
   
   @Controller('metrics')
   export class MetricsController {
     constructor(private metricsService: MetricsService) {}
     
     @Get()
     async getMetrics(): Promise<string> {
       return this.metricsService.getMetrics();
     }
   }
   ```

5. Create HTTP interceptor
   ```typescript
   // libs/common/src/interceptors/metrics.interceptor.ts
   import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
   import { Observable } from 'rxjs';
   import { tap } from 'rxjs/operators';
   import { MetricsService } from '../metrics/metrics.service';
   
   @Injectable()
   export class MetricsInterceptor implements NestInterceptor {
     constructor(private metricsService: MetricsService) {}
     
     intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
       const request = context.switchToHttp().getRequest();
       const response = context.switchToHttp().getResponse();
       const startTime = Date.now();
       
       return next.handle().pipe(
         tap(() => {
           const duration = (Date.now() - startTime) / 1000;
           const { method, route } = request;
           const statusCode = response.statusCode;
           
           this.metricsService.httpRequestDuration.observe(
             { method, route: route?.path || 'unknown', status_code: statusCode },
             duration
           );
           
           this.metricsService.httpRequestTotal.inc({
             method,
             route: route?.path || 'unknown',
             status_code: statusCode,
           });
         }),
       );
     }
   }
   ```

6. Instrument database queries
   ```typescript
   // libs/common/src/prisma/prisma.service.ts
   import { Injectable, OnModuleInit } from '@nestjs/common';
   import { PrismaClient } from '@prisma/client';
   import { MetricsService } from '../metrics/metrics.service';
   
   @Injectable()
   export class PrismaService extends PrismaClient implements OnModuleInit {
     constructor(private metricsService: MetricsService) {
       super({
         log: ['query', 'error', 'warn'],
       });
     }
     
     async onModuleInit() {
       await this.$connect();
       
       // Instrument queries
       this.$use(async (params, next) => {
         const startTime = Date.now();
         const result = await next(params);
         const duration = (Date.now() - startTime) / 1000;
         
         this.metricsService.dbQueryDuration.observe(
           { operation: params.action, model: params.model },
           duration
         );
         
         return result;
       });
     }
   }
   ```

7. Setup Prometheus server
   ```yaml
   # infrastructure/docker/prometheus/prometheus.yml
   global:
     scrape_interval: 15s
     evaluation_interval: 15s
   
   scrape_configs:
     - job_name: 'auth-service'
       static_configs:
         - targets: ['auth-service:3001']
       metrics_path: '/metrics'
   
     - job_name: 'user-service'
       static_configs:
         - targets: ['user-service:3002']
   
     - job_name: 'chat-service'
       static_configs:
         - targets: ['chat-service:3003']
   
     - job_name: 'postgres'
       static_configs:
         - targets: ['postgres-exporter:9187']
   
     - job_name: 'nginx'
       static_configs:
         - targets: ['nginx-exporter:9113']
   ```

8. Add to docker-compose
   ```yaml
   # infrastructure/docker/docker-compose.yml
   services:
     prometheus:
       image: prom/prometheus:latest
       volumes:
         - ./prometheus/prometheus.yml:/etc/prometheus/prometheus.yml
         - prometheus_data:/prometheus
       command:
         - '--config.file=/etc/prometheus/prometheus.yml'
         - '--storage.tsdb.path=/prometheus'
       ports:
         - "9090:9090"
   
     postgres-exporter:
       image: prometheuscommunity/postgres-exporter
       environment:
         DATA_SOURCE_NAME: "postgresql://${DB_USER}:${DB_PASSWORD}@postgres:5432/${DB_NAME}?sslmode=disable"
       ports:
         - "9187:9187"
   
     nginx-exporter:
       image: nginx/nginx-prometheus-exporter:latest
       command:
         - '-nginx.scrape-uri=http://nginx:80/stub_status'
       ports:
         - "9113:9113"
   
   volumes:
     prometheus_data:
   ```

**Common Pitfalls:**
- ⚠️ High cardinality labels - Don't use user IDs in labels
- ⚠️ Missing metrics endpoint - Expose `/metrics` on each service
- ⚠️ Scrape failures - Check Prometheus targets UI
- ⚠️ Memory usage - Prometheus stores time-series data, set retention

**Success Criteria:**
- [ ] Prometheus scrapes all services successfully
- [ ] HTTP request metrics recorded
- [ ] Database query metrics recorded
- [ ] Custom business metrics (active users, messages) work

---

#### 4.2 Grafana Dashboards

**Why Grafana?**
Best-in-class visualization. Pre-built dashboards for common exporters.

**Steps:**
1. Add Grafana to docker-compose
   ```yaml
   grafana:
     image: grafana/grafana:latest
     environment:
       GF_SECURITY_ADMIN_PASSWORD: ${GRAFANA_PASSWORD}
       GF_INSTALL_PLUGINS: grafana-piechart-panel
     volumes:
       - grafana_data:/var/lib/grafana
       - ./grafana/provisioning:/etc/grafana/provisioning
     ports:
       - "3000:3000"
   
   volumes:
     grafana_data:
   ```

2. Provision Prometheus datasource
   ```yaml
   # infrastructure/docker/grafana/provisioning/datasources/prometheus.yml
   apiVersion: 1
   
   datasources:
     - name: Prometheus
       type: prometheus
       access: proxy
       url: http://prometheus:9090
       isDefault: true
       editable: false
   ```

3. Create application dashboard JSON
   ```json
   {
     "dashboard": {
       "title": "DevSecOps Platform",
       "panels": [
         {
           "title": "HTTP Request Rate",
           "targets": [
             {
               "expr": "rate(http_requests_total[5m])"
             }
           ],
           "type": "graph"
         },
         {
           "title": "HTTP Request Duration (p95)",
           "targets": [
             {
               "expr": "histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))"
             }
           ],
           "type": "graph"
         },
         {
           "title": "Active Users",
           "targets": [
             {
               "expr": "active_users_total"
             }
           ],
           "type": "stat"
         },
         {
           "title": "Messages per Minute",
           "targets": [
             {
               "expr": "rate(chat_messages_total[1m]) * 60"
             }
           ],
           "type": "graph"
         },
         {
           "title": "Database Query Duration",
           "targets": [
             {
               "expr": "histogram_quantile(0.95, rate(db_query_duration_seconds_bucket[5m]))",
               "legendFormat": "{{operation}} on {{model}}"
             }
           ],
           "type": "graph"
         },
         {
           "title": "WebSocket Connections",
           "targets": [
             {
               "expr": "websocket_connections_active"
             }
           ],
           "type": "graph"
         }
       ]
     }
   }
   ```

4. Provision dashboard
   ```yaml
   # infrastructure/docker/grafana/provisioning/dashboards/default.yml
   apiVersion: 1
   
   providers:
     - name: 'Default'
       folder: ''
       type: file
       options:
         path: /etc/grafana/provisioning/dashboards
   ```

5. Setup Alertmanager
   ```yaml
   # infrastructure/docker/alertmanager/alertmanager.yml
   global:
     resolve_timeout: 5m
   
   route:
     group_by: ['alertname', 'severity']
     group_wait: 10s
     group_interval: 10s
     repeat_interval: 1h
     receiver: 'email-notifications'
   
   receivers:
     - name: 'email-notifications'
       email_configs:
         - to: 'ops@example.com'
           from: 'alertmanager@example.com'
           smarthost: 'smtp.gmail.com:587'
           auth_username: 'your-email@gmail.com'
           auth_password: 'your-app-password'
   ```

6. Create alert rules
   ```yaml
   # infrastructure/docker/prometheus/alerts.yml
   groups:
     - name: application
       interval: 30s
       rules:
         - alert: HighErrorRate
           expr: rate(http_requests_total{status_code=~"5.."}[5m]) > 0.05
           for: 5m
           labels:
             severity: critical
           annotations:
             summary: "High error rate detected"
             description: "Error rate is {{ $value }}%"
   
         - alert: DatabaseSlow
           expr: histogram_quantile(0.95, rate(db_query_duration_seconds_bucket[5m])) > 1
           for: 5m
           labels:
             severity: warning
           annotations:
             summary: "Database queries are slow"
   
         - alert: ServiceDown
           expr: up{job=~".*-service"} == 0
           for: 1m
           labels:
             severity: critical
           annotations:
             summary: "Service {{ $labels.job }} is down"
   
         - alert: HighMemoryUsage
           expr: (node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes) / node_memory_MemTotal_bytes > 0.9
           for: 5m
           labels:
             severity: warning
   
         - alert: DiskSpaceLow
           expr: (node_filesystem_avail_bytes / node_filesystem_size_bytes) < 0.1
           for: 5m
           labels:
             severity: critical
   ```

**Common Pitfalls:**
- ⚠️ Dashboard overload - Focus on key metrics (RED: Rate, Errors, Duration)
- ⚠️ Alert fatigue - Set appropriate thresholds, use `for` clause
- ⚠️ No runbooks - Link alerts to documentation

**Success Criteria:**
- [ ] Grafana accessible at localhost:3000
- [ ] All panels show data
- [ ] Alerts trigger when thresholds exceeded
- [ ] Alert notifications received (email/Slack)

---

#### 4.3 ELK Stack - Centralized Logging

**Why ELK?**
- Elasticsearch: Fast full-text search
- Logstash: Flexible log transformation
- Kibana: Powerful log exploration

**Steps:**
1. Add ELK to docker-compose
   ```yaml
   elasticsearch:
     image: docker.elastic.co/elasticsearch/elasticsearch:8.11.0
     environment:
       - discovery.type=single-node
       - xpack.security.enabled=false
       - "ES_JAVA_OPTS=-Xms512m -Xmx512m"
     volumes:
       - elasticsearch_data:/usr/share/elasticsearch/data
     ports:
       - "9200:9200"
   
   logstash:
     image: docker.elastic.co/logstash/logstash:8.11.0
     volumes:
       - ./logstash/logstash.conf:/usr/share/logstash/pipeline/logstash.conf
     depends_on:
       - elasticsearch
     ports:
       - "5000:5000"
   
   kibana:
     image: docker.elastic.co/kibana/kibana:8.11.0
     environment:
       ELASTICSEARCH_HOSTS: http://elasticsearch:9200
     ports:
       - "5601:5601"
     depends_on:
       - elasticsearch
   
   volumes:
     elasticsearch_data:
   ```

2. Configure Logstash pipeline
   ```ruby
   # infrastructure/docker/logstash/logstash.conf
   input {
     tcp {
       port => 5000
       codec => json
     }
   }
   
   filter {
     # Parse timestamp
     date {
       match => [ "timestamp", "ISO8601" ]
       target => "@timestamp"
     }
   
     # Add geo data for IP addresses
     if [client_ip] {
       geoip {
         source => "client_ip"
       }
     }
   
     # Parse user agent
     if [user_agent] {
       useragent {
         source => "user_agent"
         target => "ua"
       }
     }
   
     # Redact sensitive data
     mutate {
       remove_field => [ "password", "token", "creditCard" ]
     }
   }
   
   output {
     elasticsearch {
       hosts => ["elasticsearch:9200"]
       index => "app-logs-%{+YYYY.MM.dd}"
     }
     
     stdout {
       codec => rubydebug
     }
   }
   ```

3. Setup Winston logger in services
   ```bash
   npm install winston winston-logstash
   ```

4. Create logger module
   ```typescript
   // libs/common/src/logger/logger.module.ts
   import { Module } from '@nestjs/common';
   import { LoggerService } from './logger.service';
   
   @Module({
     providers: [LoggerService],
     exports: [LoggerService],
   })
   export class LoggerModule {}
   ```

5. Implement logger service
   ```typescript
   // libs/common/src/logger/logger.service.ts
   import { Injectable } from '@nestjs/common';
   import * as winston from 'winston';
   import 'winston-logstash';
   
   @Injectable()
   export class LoggerService {
     private logger: winston.Logger;
   
     constructor() {
       this.logger = winston.createLogger({
         level: process.env.LOG_LEVEL || 'info',
         format: winston.format.combine(
           winston.format.timestamp(),
           winston.format.errors({ stack: true }),
           winston.format.json()
         ),
         defaultMeta: {
           service: process.env.SERVICE_NAME,
           environment: process.env.NODE_ENV,
         },
         transports: [
           new winston.transports.Console({
             format: winston.format.combine(
               winston.format.colorize(),
               winston.format.simple()
             ),
           }),
           new winston.transports.Logstash({
             port: 5000,
             host: process.env.LOGSTASH_HOST || 'logstash',
             node_name: process.env.SERVICE_NAME,
           }),
         ],
       });
     }
   
     log(message: string, context?: string, metadata?: any) {
       this.logger.info(message, { context, ...metadata });
     }
   
     error(message: string, trace?: string, context?: string, metadata?: any) {
       this.logger.error(message, { trace, context, ...metadata });
     }
   
     warn(message: string, context?: string, metadata?: any) {
       this.logger.warn(message, { context, ...metadata });
     }
   
     debug(message: string, context?: string, metadata?: any) {
       this.logger.debug(message, { context, ...metadata });
     }
   }
   ```

6. Use logger in services
   ```typescript
   // Example: apps/auth-service/src/auth.service.ts
   @Injectable()
   export class AuthService {
     constructor(
       private prisma: PrismaService,
       private logger: LoggerService,
     ) {}
   
     async login(dto: LoginDto) {
       this.logger.log('Login attempt', 'AuthService', { email: dto.email });
   
       try {
         const user = await this.prisma.user.findUnique({
           where: { email: dto.email },
         });
   
         if (!user) {
           this.logger.warn('Login failed: user not found', 'AuthService', {
             email: dto.email,
           });
           throw new UnauthorizedException('Invalid credentials');
         }
   
         const isValidPassword = await bcrypt.compare(dto.password, user.passwordHash);
   
         if (!isValidPassword) {
           this.logger.warn('Login failed: invalid password', 'AuthService', {
             userId: user.id,
           });
           throw new UnauthorizedException('Invalid credentials');
         }
   
         this.logger.log('Login successful', 'AuthService', {
           userId: user.id,
         });
   
         return this.generateToken(user);
       } catch (error) {
         this.logger.error('Login error', error.stack, 'AuthService', {
           email: dto.email,
         });
         throw error;
       }
     }
   }
   ```

7. Setup Kibana index pattern
   ```
   1. Open Kibana: http://localhost:5601
   2. Go to Management > Stack Management > Index Patterns
   3. Create pattern: app-logs-*
   4. Select timestamp field: @timestamp
   ```

8. Create useful Kibana queries
   ```
   # Failed login attempts
   level: "warn" AND message: "Login failed"
   
   # Errors in last hour
   level: "error" AND @timestamp > now-1h
   
   # Slow database queries
   db_query_duration > 1
   
   # Specific user activity
   userId: "abc-123-def"
   ```

**Common Pitfalls:**
- ⚠️ PII in logs - Scrub sensitive data (passwords, tokens, emails)
- ⚠️ Log volume - Set retention policy (7-30 days)
- ⚠️ Unstructured logs - Always use JSON format
- ⚠️ Missing correlation IDs - Add trace ID to follow requests across services
- ⚠️ Elasticsearch storage - Monitor disk usage, logs grow fast

**Security Considerations:**
```typescript
// BAD: Logs password
this.logger.log('User login', { email, password });

// GOOD: Never log sensitive data
this.logger.log('User login attempt', { email });

// GOOD: Sanitize objects
const sanitized = { ...userData };
delete sanitized.password;
delete sanitized.token;
this.logger.log('User data', sanitized);
```

**Success Criteria:**
- [ ] Logs appear in Kibana
- [ ] Can search logs by level, service, user
- [ ] Correlation IDs link related logs
- [ ] No sensitive data (passwords, tokens) in logs
- [ ] Index lifecycle policy configured (retention)

---

### Phase 5: Frontend & Integration (Week 9-10)

---

#### 5.1 Next.js Setup

**Steps:**
1. Create Next.js app
   ```bash
   npx create-next-app@latest frontend --typescript --tailwind --app
   cd frontend
   ```

2. Install dependencies
   ```bash
   npm install next-auth socket.io-client @tanstack/react-query zustand
   npm install -D @types/node
   ```

3. Setup environment variables
   ```env
   # frontend/.env.local
   NEXT_PUBLIC_API_URL=https://localhost/api
   NEXT_PUBLIC_WS_URL=https://localhost
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-secret-here
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   ```

4. Configure NextAuth
   ```typescript
   // frontend/app/api/auth/[...nextauth]/route.ts
   import NextAuth, { NextAuthOptions } from 'next-auth';
   import GoogleProvider from 'next-auth/providers/google';
   import CredentialsProvider from 'next-auth/providers/credentials';
   
   export const authOptions: NextAuthOptions = {
     providers: [
       GoogleProvider({
         clientId: process.env.GOOGLE_CLIENT_ID!,
         clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
       }),
       CredentialsProvider({
         name: 'Credentials',
         credentials: {
           email: { label: "Email", type: "email" },
           password: { label: "Password", type: "password" }
         },
         async authorize(credentials) {
           const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify(credentials),
           });
   
           const user = await res.json();
   
           if (res.ok && user) {
             return user;
           }
           return null;
         }
       })
     ],
     callbacks: {
       async jwt({ token, user, account }) {
         if (account && user) {
           return {
             ...token,
             accessToken: user.access_token,
             userId: user.id,
           };
         }
         return token;
       },
       async session({ session, token }) {
         return {
           ...session,
           user: {
             ...session.user,
             id: token.userId,
           },
           accessToken: token.accessToken,
         };
       },
     },
     pages: {
       signIn: '/auth/signin',
     },
   };
   
   const handler = NextAuth(authOptions);
   export { handler as GET, handler as POST };
   ```

5. Create auth components (register, login)
6. Setup protected routes middleware
7. Implement user list with filters
8. Create chat interface with Socket.io
9. Add notifications

*(Steps 5-9 are detailed in separate sections below)*

---

#### 5.2 WebSocket Client Integration

**Steps:**
1. Create Socket context
   ```typescript
   // frontend/contexts/SocketContext.tsx
   'use client';
   
   import { createContext, useContext, useEffect, useState } from 'react';
   import { io, Socket } from 'socket.io-client';
   import { useSession } from 'next-auth/react';
   
   interface SocketContextType {
     socket: Socket | null;
     isConnected: boolean;
   }
   
   const SocketContext = createContext<SocketContextType>({
     socket: null,
     isConnected: false,
   });
   
   export function SocketProvider({ children }: { children: React.ReactNode }) {
     const { data: session } = useSession();
     const [socket, setSocket] = useState<Socket | null>(null);
     const [isConnected, setIsConnected] = useState(false);
   
     useEffect(() => {
       if (!session?.accessToken) return;
   
       const socketInstance = io(process.env.NEXT_PUBLIC_WS_URL!, {
         auth: {
           token: session.accessToken,
         },
         transports: ['websocket'],
       });
   
       socketInstance.on('connect', () => {
         console.log('WebSocket connected');
         setIsConnected(true);
       });
   
       socketInstance.on('disconnect', () => {
         console.log('WebSocket disconnected');
         setIsConnected(false);
       });
   
       setSocket(socketInstance);
   
       return () => {
         socketInstance.disconnect();
       };
     }, [session]);
   
     return (
       <SocketContext.Provider value={{ socket, isConnected }}>
         {children}
       </SocketContext.Provider>
     );
   }
   
   export const useSocket = () => useContext(SocketContext);
   ```

2. Create chat hook
   ```typescript
   // frontend/hooks/useChat.ts
   import { useEffect, useState } from 'react';
   import { useSocket } from '@/contexts/SocketContext';
   
   export interface Message {
     id: string;
     senderId: string;
     senderUsername: string;
     content: string;
     createdAt: string;
   }
   
   export function useChat(recipientId: string) {
     const { socket, isConnected } = useSocket();
     const [messages, setMessages] = useState<Message[]>([]);
     const [isTyping, setIsTyping] = useState(false);
   
     useEffect(() => {
       if (!socket || !recipientId) return;
   
       const messageHandler = (message: Message) => {
         setMessages(prev => [...prev, message]);
       };
   
       const typingHandler = ({ userId, isTyping }: { userId: string; isTyping: boolean }) => {
         if (userId === recipientId) {
           setIsTyping(isTyping);
         }
       };
   
       socket.on(`message:${recipientId}`, messageHandler);
       socket.on(`typing:${recipientId}`, typingHandler);
   
       return () => {
         socket.off(`message:${recipientId}`, messageHandler);
         socket.off(`typing:${recipientId}`, typingHandler);
       };
     }, [socket, recipientId]);
   
     const sendMessage = (content: string) => {
       if (!socket || !content.trim()) return;
   
       socket.emit('message:send', {
         receiverId: recipientId,
         content: content.trim(),
       });
     };
   
     const startTyping = () => {
       if (!socket) return;
       socket.emit('typing:start', { receiverId: recipientId });
     };
   
     const stopTyping = () => {
       if (!socket) return;
       socket.emit('typing:stop', { receiverId: recipientId });
     };
   
     return {
       messages,
       isTyping,
       sendMessage,
       startTyping,
       stopTyping,
       isConnected,
     };
   }
   ```

3. Create chat component
   ```typescript
   // frontend/components/Chat.tsx
   'use client';
   
   import { useState, useEffect, useRef } from 'react';
   import { useChat } from '@/hooks/useChat';
   
   interface ChatProps {
     recipientId: string;
     recipientName: string;
   }
   
   export function Chat({ recipientId, recipientName }: ChatProps) {
     const [input, setInput] = useState('');
     const messagesEndRef = useRef<HTMLDivElement>(null);
     const { messages, isTyping, sendMessage, startTyping, stopTyping, isConnected } = useChat(recipientId);
   
     useEffect(() => {
       messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
     }, [messages]);
   
     const handleSubmit = (e: React.FormEvent) => {
       e.preventDefault();
       if (!input.trim()) return;
   
       sendMessage(input);
       setInput('');
       stopTyping();
     };
   
     const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
       setInput(e.target.value);
       if (e.target.value) {
         startTyping();
       } else {
         stopTyping();
       }
     };
   
     return (
       <div className="flex flex-col h-full">
         <div className="p-4 border-b">
           <h2 className="font-semibold">{recipientName}</h2>
           <p className="text-sm text-gray-500">
             {isConnected ? 'Connected' : 'Disconnected'}
           </p>
         </div>
   
         <div className="flex-1 overflow-y-auto p-4 space-y-2">
           {messages.map((msg) => (
             <div key={msg.id} className="flex flex-col">
               <span className="text-xs text-gray-500">{msg.senderUsername}</span>
               <div className="bg-gray-100 rounded-lg p-2">
                 {msg.content}
               </div>
             </div>
           ))}
           {isTyping && (
             <div className="text-sm text-gray-500 italic">
               {recipientName} is typing...
             </div>
           )}
           <div ref={messagesEndRef} />
         </div>
   
         <form onSubmit={handleSubmit} className="p-4 border-t">
           <div className="flex gap-2">
             <input
               type="text"
               value={input}
               onChange={handleInputChange}
               placeholder="Type a message..."
               className="flex-1 px-4 py-2 border rounded-lg"
               disabled={!isConnected}
             />
             <button
               type="submit"
               disabled={!isConnected || !input.trim()}
               className="px-6 py-2 bg-blue-500 text-white rounded-lg disabled:opacity-50"
             >
               Send
             </button>
           </div>
         </form>
       </div>
     );
   }
   ```

**Success Criteria:**
- [ ] WebSocket connects with valid JWT
- [ ] Messages send and receive in real-time
- [ ] Typing indicators work
- [ ] Auto-reconnects on network loss
- [ ] UI shows connection status

---

### Phase 6: CI/CD Pipeline (Week 11)

---

#### 6.1 GitHub Actions Workflow

**Steps:**
1. Create workflow file
   ```yaml
   # .github/workflows/ci.yml
   name: CI/CD Pipeline
   
   on:
     push:
       branches: [main, develop]
     pull_request:
       branches: [main]
   
   jobs:
     lint:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v4
         
         - name: Setup Node.js
           uses: actions/setup-node@v4
           with:
             node-version: '20'
             cache: 'npm'
         
         - name: Install dependencies
           run: npm ci
         
         - name: Commitlint
           run: npx commitlint --from HEAD~1 --to HEAD --verbose
         
         - name: ESLint
           run: npm run lint
         
         - name: Prettier check
           run: npm run format:check
         
         - name: Hadolint (Dockerfile linting)
           uses: hadolint/hadolint-action@v3.1.0
           with:
             dockerfile: "infrastructure/docker/*/Dockerfile"
     
     security:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v4
         
         - name: Run Trivy vulnerability scanner
           uses: aquasecurity/trivy-action@master
           with:
             scan-type: 'fs'
             scan-ref: '.'
             format: 'sarif'
             output: 'trivy-results.sarif'
         
         - name: Upload Trivy results to GitHub Security
           uses: github/codeql-action/upload-sarif@v2
           with:
             sarif_file: 'trivy-results.sarif'
         
         - name: Run Snyk
           uses: snyk/actions/node@master
           env:
             SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
           with:
             args: --severity-threshold=high
     
     test:
       runs-on: ubuntu-latest
       services:
         postgres:
           image: postgres:16-alpine
           env:
             POSTGRES_USER: test_user
             POSTGRES_PASSWORD: test_password
             POSTGRES_DB: test_db
           options: >-
             --health-cmd pg_isready
             --health-interval 10s
             --health-timeout 5s
             --health-retries 5
           ports:
             - 5432:5432
       
       steps:
         - uses: actions/checkout@v4
         
         - name: Setup Node.js
           uses: actions/setup-node@v4
           with:
             node-version: '20'
             cache: 'npm'
         
         - name: Install dependencies
           run: npm ci
         
         - name: Run Prisma migrations
           env:
             DATABASE_URL: postgresql://test_user:test_password@localhost:5432/test_db
           run: npx prisma migrate deploy
         
         - name: Run unit tests
           run: npm run test:unit
         
         - name: Run integration tests
           env:
             DATABASE_URL: postgresql://test_user:test_password@localhost:5432/test_db
           run: npm run test:integration
         
         - name: Upload coverage
           uses: codecov/codecov-action@v3
     
     build:
       runs-on: ubuntu-latest
       needs: [lint, security, test]
       steps:
         - uses: actions/checkout@v4
         
         - name: Set up Docker Buildx
           uses: docker/setup-buildx-action@v3
         
         - name: Login to Docker Hub
           uses: docker/login-action@v3
           with:
             username: ${{ secrets.DOCKERHUB_USERNAME }}
             password: ${{ secrets.DOCKERHUB_TOKEN }}
         
         - name: Build and push auth-service
           uses: docker/build-push-action@v5
           with:
             context: .
             file: ./infrastructure/docker/auth-service/Dockerfile
             push: ${{ github.event_name != 'pull_request' }}
             tags: |
               ${{ secrets.DOCKERHUB_USERNAME }}/auth-service:latest
               ${{ secrets.DOCKERHUB_USERNAME }}/auth-service:${{ github.sha }}
             cache-from: type=gha
             cache-to: type=gha,mode=max
         
         # Repeat for other services...
     
     sonarqube:
       runs-on: ubuntu-latest
       needs: [test]
       steps:
         - uses: actions/checkout@v4
           with:
             fetch-depth: 0
         
         - name: SonarQube Scan
           uses: sonarsource/sonarqube-scan-action@master
           env:
             SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
             SONAR_HOST_URL: ${{ secrets.SONAR_HOST_URL }}
     
     deploy:
       runs-on: ubuntu-latest
       needs: [build]
       if: github.ref == 'refs/heads/main'
       steps:
         - uses: actions/checkout@v4
         
         - name: Deploy to staging
           run: |
             # Deploy logic here
             echo "Deploying to staging..."
   ```

2. Setup GitHub secrets
   ```
   - DOCKERHUB_USERNAME
   - DOCKERHUB_TOKEN
   - SNYK_TOKEN
   - SONAR_TOKEN
   - SONAR_HOST_URL
   ```

3. Add status badges to README
   ```markdown
   ![CI](https://github.com/username/repo/workflows/CI/badge.svg)
   ![Security](https://img.shields.io/snyk/vulnerabilities/github/username/repo)
   ![Coverage](https://codecov.io/gh/username/repo/branch/main/graph/badge.svg)
   ```

**Common Pitfalls:**
- ⚠️ Secrets in logs - Use `::add-mask::` for sensitive output
- ⚠️ Slow builds - Use caching (npm, Docker layers)
- ⚠️ Flaky tests - Retry or fix properly
- ⚠️ No branch protection - Require checks before merge

**Success Criteria:**
- [ ] All checks pass on every commit
- [ ] Security scans block vulnerable dependencies
- [ ] Docker images built and pushed
- [ ] Coverage reports uploaded
- [ ] Deploy only on main branch

---

## 🔒 Security Considerations

### Defense in Depth Strategy

This project implements multiple security layers:

```
┌─────────────────────────────────────────┐
│         1. Edge Security (WAF)          │ ← SQL injection, XSS blocked
├─────────────────────────────────────────┤
│      2. Transport Security (TLS)        │ ← HTTPS, secure WebSockets
├─────────────────────────────────────────┤
│    3. Authentication (OAuth + JWT)      │ ← Identity verification
├─────────────────────────────────────────┤
│    4. Authorization (RBAC/Guards)       │ ← Access control
├─────────────────────────────────────────┤
│   5. Input Validation (DTOs + class)    │ ← Prevent injection
├─────────────────────────────────────────┤
│  6. Secrets Management (Vault)          │ ← No hardcoded credentials
├─────────────────────────────────────────┤
│  7. Dependency Scanning (Snyk/Trivy)    │ ← Known vulnerabilities
└─────────────────────────────────────────┘
```

### Security Checklist

#### **Authentication & Authorization**
- [ ] Passwords hashed with bcrypt (cost ≥ 10)
- [ ] JWT tokens expire (≤ 1 hour)
- [ ] Refresh token rotation implemented
- [ ] OAuth state parameter validated (CSRF)
- [ ] 2FA available for admin accounts
- [ ] Account lockout after failed attempts (5-10)
- [ ] Password complexity requirements enforced

#### **API Security**
- [ ] Rate limiting on all endpoints
- [ ] CORS properly configured (no `*` in production)
- [ ] Request size limits enforced
- [ ] SQL injection prevented (Prisma parameterized queries)
- [ ] XSS prevented (Content Security Policy headers)
- [ ] CSRF tokens on state-changing operations
- [ ] API versioning implemented

#### **Data Security**
- [ ] No sensitive data in JWT payload
- [ ] Database credentials in Vault, not .env
- [ ] Database connections use TLS
- [ ] PII encrypted at rest
- [ ] Audit logs for data access/changes
- [ ] Data retention policies defined
- [ ] GDPR compliance (data export/deletion)

#### **Infrastructure Security**
- [ ] Containers run as non-root user
- [ ] Docker images scanned for vulnerabilities
- [ ] No secrets in Docker layers (use BuildKit secrets)
- [ ] Network segmentation (services can't reach each other unnecessarily)
- [ ] Minimal container capabilities
- [ ] Read-only container filesystems where possible
- [ ] Security updates automated (Dependabot)

### Threat Model

| Threat | Mitigation |
|--------|-----------|
| Brute force | Rate limiting, account lockout |
| JWT theft | Short expiry, HTTPS, HttpOnly cookies |
| SQL injection | Prisma ORM, parameterized queries |
| XSS | CSP headers, input sanitization |
| CSRF | SameSite cookies, CSRF tokens |
| Man-in-the-middle | TLS everywhere, HSTS |
| Container escape | Non-root, minimal capabilities |
| Secret exposure | Vault, gitignore, .env.example |

---

## 🧪 Testing Strategy

### Test Pyramid

```
        ┌───────┐
       /   E2E   \          (Playwright - few, slow)
      ────────────
     / Integration \        (Jest + DB - moderate)
    ────────────────
   /    Unit Tests   \       (Jest - many, fast)
  ────────────────────
 /    Bash Scripts     \      (Custom library)
────────────────────────
```

### Custom Bash Testing Library

```bash
#!/bin/bash
# scripts/tests/lib/test_framework.sh

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Counters
TESTS_RUN=0
TESTS_PASSED=0
TESTS_FAILED=0

# Assertions
assert_equals() {
  local expected="$1"
  local actual="$2"
  local message="${3:-Assertion failed}"
  
  TESTS_RUN=$((TESTS_RUN + 1))
  
  if [[ "$expected" == "$actual" ]]; then
    echo -e "${GREEN}✓ PASS${NC} $message"
    TESTS_PASSED=$((TESTS_PASSED + 1))
  else
    echo -e "${RED}✗ FAIL${NC} $message"
    echo -e "  Expected: ${YELLOW}$expected${NC}"
    echo -e "  Actual:   ${YELLOW}$actual${NC}"
    TESTS_FAILED=$((TESTS_FAILED + 1))
  fi
}

assert_http_status() {
  local url="$1"
  local expected_status="$2"
  local message="${3:-HTTP status check}"
  
  local actual_status=$(curl -s -o /dev/null -w "%{http_code}" "$url")
  assert_equals "$expected_status" "$actual_status" "$message"
}

assert_container_running() {
  local container="$1"
  local status=$(docker inspect -f '{{.State.Status}}' "$container" 2>/dev/null)
  assert_equals "running" "$status" "Container $container should be running"
}

assert_port_open() {
  local host="$1"
  local port="$2"
  
  nc -zw 3 "$host" "$port" 2>/dev/null
  local result=$?
  assert_equals "0" "$result" "Port $port should be open on $host"
}

print_results() {
  echo ""
  echo "=================================="
  echo -e "Results: ${GREEN}$TESTS_PASSED passed${NC}, ${RED}$TESTS_FAILED failed${NC} ($TESTS_RUN total)"
  echo "=================================="
  
  if [[ $TESTS_FAILED -gt 0 ]]; then
    exit 1
  fi
}
```

### Docker Environment Tests

```bash
#!/bin/bash
# scripts/tests/docker/test_docker_env.sh

source "$(dirname "$0")/../lib/test_framework.sh"

echo "=== Docker Environment Tests ==="

# Container tests
assert_container_running "postgres"
assert_container_running "auth-service"
assert_container_running "user-service"
assert_container_running "chat-service"
assert_container_running "nginx"
assert_container_running "prometheus"
assert_container_running "grafana"
assert_container_running "elasticsearch"
assert_container_running "kibana"

# Port tests
assert_port_open "localhost" "443"
assert_port_open "localhost" "9090"
assert_port_open "localhost" "3000"
assert_port_open "localhost" "5601"

# API health checks
assert_http_status "https://localhost/api/health" "200" "API Gateway health"
assert_http_status "http://localhost:9090/-/healthy" "200" "Prometheus health"
assert_http_status "http://localhost:3000/api/health" "200" "Grafana health"

print_results
```

### API Tests (Bash)

```bash
#!/bin/bash
# scripts/tests/api/test_auth.sh

source "$(dirname "$0")/../lib/test_framework.sh"

BASE_URL="https://localhost/api"

echo "=== Auth API Tests ==="

# Register
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Password123!","username":"testuser"}' \
  -k)

TOKEN=$(echo "$REGISTER_RESPONSE" | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)

assert_equals "true" "$([ -n "$TOKEN" ] && echo true || echo false)" "Should receive access token"

# Login
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Password123!"}' \
  -k)

LOGIN_TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)
assert_equals "true" "$([ -n "$LOGIN_TOKEN" ] && echo true || echo false)" "Login should return token"

# Protected endpoint
PROFILE_STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
  "$BASE_URL/users/me" \
  -H "Authorization: Bearer $LOGIN_TOKEN" \
  -k)
assert_equals "200" "$PROFILE_STATUS" "Profile endpoint should return 200"

# Invalid login
INVALID_STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
  -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"wrongpassword"}' \
  -k)
assert_equals "401" "$INVALID_STATUS" "Invalid login should return 401"

# Rate limiting
for i in {1..10}; do
  curl -s -X POST "$BASE_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"wrong"}' -k > /dev/null
done

RATE_LIMITED=$(curl -s -o /dev/null -w "%{http_code}" \
  -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"wrong"}' -k)
assert_equals "429" "$RATE_LIMITED" "Should rate limit after many failed attempts"

print_results
```

---

## 📖 Getting Started

### Prerequisites

- Docker 24.0+
- Docker Compose 2.20+
- Node.js 20+
- npm 10+
- Git

### Quick Start

```bash
# Clone the repository
git clone https://github.com/username/devsecops-platform.git
cd devsecops-platform

# Copy environment file
cp .env.example .env

# Create secrets directory
mkdir -p infrastructure/docker/secrets
echo "your-db-password" > infrastructure/docker/secrets/db_password.txt

# Generate SSL certificates
cd infrastructure/docker/nginx/ssl
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout key.pem -out cert.pem -subj "/CN=localhost"
cd -

# Start the stack
docker-compose up -d

# Wait for services to be ready
./scripts/wait-for-services.sh

# Run database migrations
docker-compose exec auth-service npx prisma migrate deploy

# Seed the database
docker-compose exec auth-service npx prisma db seed

# Run smoke tests
./scripts/tests/run_all.sh
```

### Service URLs

| Service | URL | Notes |
|---------|-----|-------|
| Frontend | https://localhost | Main application |
| API Gateway | https://localhost/api | REST API |
| Grafana | http://localhost:3000 | admin/admin |
| Kibana | http://localhost:5601 | Log exploration |
| Prometheus | http://localhost:9090 | Metrics |
| Vault | http://localhost:8200 | Secrets |
| Prisma Studio | Run `npx prisma studio` | DB explorer |

---

## 🔧 Development Workflow

### Branch Strategy

```
main          ← Production, protected, requires PR
  └─ develop  ← Integration branch
       ├─ feat/user-search
       ├─ fix/websocket-auth
       └─ sec/update-dependencies
```

### Commit Convention

```
feat: add user search with filters
fix: resolve WebSocket authentication race condition
sec: update dependencies with known vulnerabilities
docs: add API documentation
chore: update Docker base images
ci: add Trivy scanning to pipeline
```

### Development Commands

```bash
# Start development environment
docker-compose up -d

# Start specific service with hot reload
cd services/auth-service && npm run start:dev

# Run tests in watch mode
npm run test:watch

# Check logs
docker-compose logs -f auth-service

# Access database
npx prisma studio

# Lint code
npm run lint

# Format code
npm run format

# Run all bash tests
./scripts/tests/run_all.sh

# Run specific test suite
./scripts/tests/docker/test_docker_env.sh
./scripts/tests/api/test_auth.sh
```

---

## 🔄 Backup & Disaster Recovery

### Automated Backups

```bash
#!/bin/bash
# scripts/backup/backup_postgres.sh

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/postgres"
RETENTION_DAYS=7

mkdir -p "$BACKUP_DIR"

# Create backup
docker-compose exec -T postgres pg_dump \
  -U "$DB_USER" \
  -d "$DB_NAME" \
  --format=custom \
  > "$BACKUP_DIR/backup_$TIMESTAMP.dump"

echo "Backup created: backup_$TIMESTAMP.dump"

# Cleanup old backups
find "$BACKUP_DIR" -name "*.dump" -mtime +$RETENTION_DAYS -delete
echo "Cleaned backups older than $RETENTION_DAYS days"
```

### Recovery Procedure

```bash
# Stop the application
docker-compose stop auth-service user-service chat-service

# Restore database
docker-compose exec -T postgres pg_restore \
  -U "$DB_USER" \
  -d "$DB_NAME" \
  --clean \
  < /backups/postgres/backup_20250211_120000.dump

# Restart services
docker-compose start auth-service user-service chat-service

# Verify recovery
./scripts/tests/run_all.sh
```

---

## 📚 Resources

### Documentation
- [NestJS Documentation](https://docs.nestjs.com)
- [Prisma Documentation](https://prisma.io/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Socket.io Documentation](https://socket.io/docs)
- [Prometheus Documentation](https://prometheus.io/docs)
- [Grafana Documentation](https://grafana.com/docs)
- [Elasticsearch Documentation](https://www.elastic.co/guide)
- [HashiCorp Vault Documentation](https://developer.hashicorp.com/vault/docs)
- [ModSecurity Reference](https://github.com/owasp-modsecurity/ModSecurity/wiki)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)

### Security Resources
- [OWASP Security Cheat Sheets](https://cheatsheetseries.owasp.org)
- [JWT Best Practices](https://auth0.com/blog/a-look-at-the-latest-draft-for-jwt-bcp/)
- [Docker Security Best Practices](https://docs.docker.com/engine/security/)
- [Node.js Security Checklist](https://blog.risingstack.com/node-js-security-checklist/)

---

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

---
