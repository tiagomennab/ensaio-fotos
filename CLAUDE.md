# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Environment Setup

### Local Development Environment

**Prerequisites:**
- Node.js 18+
- PostgreSQL database (Supabase recommended for development)

**Quick Setup:**
```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env.local
# Edit .env.local with your database connection and settings

# 3. Generate Prisma client
npx prisma generate

# 4. Start development server
npm run dev
```

**Development Configuration (.env.local):**
```env
# Database - Use Supabase for development
DATABASE_URL="postgresql://postgres.[project-ref]:[password]@aws-1-sa-east-1.pooler.supabase.com:5432/postgres"

# NextAuth.js
NEXTAUTH_SECRET="dev-secret-key-for-local-development-only"
NEXTAUTH_URL="http://localhost:3000"

# Storage - Local for development
STORAGE_PROVIDER="local"

# AI Provider - Local mock for development (no API costs)
AI_PROVIDER="local"

# OAuth Providers (optional)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
```

**Local Development Features:**
- File uploads saved to `uploads/` directory
- AI training/generation uses mock responses (no external API calls)
- Rate limiting still enforced for testing
- Full authentication flow with local credentials
- Database uses Supabase (already migrated)

### Production Environment (Vercel)

**Current Production Setup:**
- **Platform**: Vercel
- **Database**: Supabase PostgreSQL
- **Storage**: AWS S3 (configured)
- **AI Provider**: Replicate (configured)
- **Domain**: [Production URL from Vercel]

**Production Configuration:**
```env
# Database - Supabase production
DATABASE_URL="postgresql://postgres.[project-ref]:[password]@aws-1-sa-east-1.pooler.supabase.com:5432/postgres"

# NextAuth.js
NEXTAUTH_SECRET="[secure-production-secret]"
NEXTAUTH_URL="https://[your-vercel-app].vercel.app"

# Storage - AWS S3
STORAGE_PROVIDER="aws"
AWS_ACCESS_KEY_ID="[aws-key]"
AWS_SECRET_ACCESS_KEY="[aws-secret]"
AWS_REGION="us-east-1"
AWS_S3_BUCKET="[bucket-name]"

# AI Provider - Replicate
AI_PROVIDER="replicate"
REPLICATE_API_TOKEN="[replicate-token]"

# Payment - Asaas
ASAAS_API_KEY="[asaas-production-key]"
ASAAS_ENVIRONMENT="production"
```

**Deployment Process:**
1. Changes pushed to main branch trigger automatic deployment
2. Vercel runs `npm run build` (includes Prisma generate)
3. Environment variables managed in Vercel dashboard
4. Database migrations applied manually when needed

## Common Development Commands

### Development
```bash
npm run dev          # Start development server (http://localhost:3000)
npm run build        # Build for production (includes Prisma generate)
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Database Operations
```bash
npx prisma generate   # Generate Prisma client (runs automatically in postinstall)
npx prisma db push    # Push schema changes to database
npx prisma migrate dev # Create and apply new migration
npx prisma studio     # Open database GUI
```

### Testing and Quality
- No specific test framework is configured - check with user before assuming testing approach
- TypeScript strict mode is enabled
- ESLint is configured but doesn't ignore build errors

## Architecture Overview

### Technology Stack
- **Framework**: Next.js 15.4.6 with App Router
- **Language**: TypeScript with strict mode
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js with multiple providers (Credentials, Google, GitHub)
- **UI**: TailwindCSS + shadcn/ui components with custom theme
- **File Storage**: Configurable (AWS S3, Cloudinary, Local)
- **AI Integration**: Configurable (Replicate, RunPod, Local mock)
- **Payments**: Asaas (Brazilian market)

### Core Business Logic

**AI Photo Generation SaaS** - Users train custom AI models with their photos and generate professional images.

**User Plans & Credits System**:
- FREE: 10 credits/day, 1 model, basic limits
- PREMIUM: 100 credits/day, 5 models, higher quality
- GOLD: 500 credits/day, 20 models, maximum features

**Key Workflows**:
1. **Model Training**: Upload face/body photos → Process → Train AI model → Generate samples
2. **Image Generation**: Select model → Input prompt → Generate variations → Save to gallery
3. **Credit Management**: Track usage, enforce limits, handle billing

### Database Schema Structure

**Core Entities**:
- `User`: Authentication, plan management, credit tracking, usage statistics
- `AIModel`: Custom trained models with status tracking and metadata
- `Generation`: Image generation requests with parameters and results
- `Collection`: User-organized image galleries
- `PhotoPackage`: Pre-built prompt templates and themes

**Supporting Systems**:
- `UsageLog`: Rate limiting and analytics tracking
- `SystemLog`: Application logging and monitoring
- `ApiKey`: API access management (future feature)

### Security & Rate Limiting

**Rate Limiting per Action & Plan**:
- API calls: 100-1000 requests per 15min based on plan
- File uploads: 20-500 per hour based on plan
- Model training: 1-20 per day based on plan
- Image generation: 10-200 per hour based on plan
- Authentication: 5 attempts per 15min (all plans)

**Security Features**:
- Content moderation for prompts and images
- Rate limiting with violation tracking
- User blocking after excessive violations
- Secure file upload validation
- NextAuth.js session management

### Provider Architecture

**AI Providers** (configurable via `AI_PROVIDER` env var):
- **Replicate**: Production-ready, FLUX/SDXL models
- **RunPod**: Alternative production option
- **Local**: Development/testing mock

**Storage Providers** (configurable via `STORAGE_PROVIDER` env var):
- **AWS S3**: Production with optional CloudFront CDN
- **Cloudinary**: Alternative with built-in CDN
- **Local**: Development only

**Payment Provider**:
- **Asaas**: Brazilian payment gateway (PIX, cards, boleto)

### Configuration Management

**Environment Variables** (see `.env.example`):
- Required: `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`
- Provider configs: OAuth, AI, Storage, Payment tokens
- Feature flags: Provider selection, SSL, monitoring

**Cost Calculation**:
- Training: Based on steps, resolution, setup cost
- Generation: Based on megapixels, inference steps
- Automatic credit deduction with plan limits

### Key Features & Components

**Authentication Flow**:
- Multi-provider auth (credentials, OAuth)
- Plan-based access control with `requirePlan()` helper
- Session enhancement with plan/credits data
- Automatic user plan assignment for OAuth

**File Upload System**:
- Multi-provider storage abstraction
- Image processing and validation
- Organized folder structure (training/face, training/body, generated)
- File size and type restrictions

**Model Training Pipeline**:
- Photo categorization (face, half-body, full-body)
- Quality scoring and validation
- Progress tracking and error handling
- Webhook integration for status updates

**Generation System**:
- Prompt engineering with templates
- Parameter validation based on user plan
- Batch processing and queue management
- Result gallery with collections

### Production Setup

**Scripts**:
- `scripts/setup-production.sh`: Complete production deployment
- `scripts/backup-database.sh`: Database backup automation

**Docker Support**:
- Multi-stage Dockerfile for optimized builds
- docker-compose.yml for complete stack
- Nginx configuration for reverse proxy

**Monitoring**:
- Health check endpoint: `/api/health`
- Metrics endpoint: `/api/monitoring/metrics`
- Structured logging with cleanup jobs
- Admin dashboards for security and monitoring

### Important Development Notes

**Next.js Configuration**:
- Turbopack enabled for development
- Remote image patterns configured for AI providers
- TypeScript and ESLint strict enforcement

**Database Migrations**:
- Migration history in `prisma/migrations/`
- Manual SQL fixes in root directory
- Auto-generated client via build process

**API Routes Structure**:
- RESTful endpoints under `/api/`
- Webhook handlers for external services
- Admin endpoints with proper access control
- Health and monitoring endpoints

**Component Organization**:
- UI components use shadcn/ui base with custom theme
- Feature-specific components grouped by domain
- Shared providers for auth and theme
- Consistent component patterns throughout

### Environment-Specific Debugging

**Local Development Issues**:
- **Database Connection**: Verify Supabase URL format and credentials
- **File Uploads**: Check if `uploads/` directories exist and have write permissions
- **Mock AI**: Responses come from `src/lib/ai/providers/local.ts`
- **Port Conflicts**: Default port is 3000, check for conflicts
- **Environment Variables**: Use `node -e "console.log(process.env.DATABASE_URL)"` to verify

**Production (Vercel) Issues**:
- **Build Failures**: Check Vercel build logs for TypeScript/ESLint errors
- **Database Timeouts**: Verify Supabase connection pooling settings
- **File Upload Errors**: Check AWS S3 bucket permissions and CORS
- **AI API Limits**: Monitor Replicate usage and rate limits
- **Environment Variables**: Manage through Vercel dashboard, not in code

**Common Database Issues**:
```bash
# Regenerate Prisma client after schema changes
npx prisma generate

# Test database connection
npx prisma db pull

# View database in GUI
npx prisma studio

# Reset database (DEVELOPMENT ONLY)
npx prisma db push --force-reset
```

**Common Build Issues**:
```bash
# Clear Next.js cache
rm -rf .next

# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Check TypeScript errors
npx tsc --noEmit

# Check ESLint errors
npm run lint
```

### Monitoring & Health Checks

**Endpoints for Monitoring**:
- **Health Check**: `GET /api/health` - Overall system status
- **Metrics**: `GET /api/monitoring/metrics` - Usage statistics
- **Database Status**: Included in health check response

**Development Debugging**:
- Enable Next.js debug mode: `DEBUG=* npm run dev`
- Database query logging: Set `log: ["query"]` in Prisma client
- Network requests: Use browser dev tools for API calls

**Production Monitoring**:
- Vercel Analytics: Built-in performance monitoring
- Supabase Dashboard: Database performance and logs
- Custom logging: Structured logs in `src/lib/monitoring/logger.ts`