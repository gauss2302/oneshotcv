# Resume Constructor

A modern, production-ready resume builder application built with Next.js, PostgreSQL, and MinIO.

## Features

- 🎨 Multiple professional resume templates
- 📝 Rich text editor with real-time preview
- 📸 Photo upload and management
- 🔐 Secure authentication (Email/Password, Google, GitHub, LinkedIn)
- 💾 Auto-save functionality
- 📄 PDF export
- 🎯 Responsive design

## Getting Started

### Development

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

### Environment Variables

Copy `.env.example` to `.env` and fill in the required values:

```bash
cp .env.example .env
```

See [Environment Variables](#environment-variables) section for details.

### Database Setup

1. Ensure PostgreSQL is running
2. Run database migrations:

```bash
npm run db:push
```

Or use Drizzle Studio to manage your database:

```bash
npm run db:studio
```

## Production Deployment

### Prerequisites

- Docker and Docker Compose
- Dokploy (self-hosted) or compatible deployment platform
- PostgreSQL database
- MinIO object storage

### Environment Variables

All required environment variables are documented in `.env.example`. Key variables for production:

#### Required

- `NODE_ENV=production`
- `DATABASE_URL` - PostgreSQL connection string
- `BETTER_AUTH_SECRET` - At least 32 characters, use a strong random string
- `NEXT_PUBLIC_APP_URL` - Your production domain URL
- `MINIO_ENDPOINT`, `MINIO_PORT`, `MINIO_ACCESS_KEY`, `MINIO_SECRET_KEY` - MinIO configuration
- `MINIO_BUCKET_NAME` - MinIO bucket name
- `NEXT_PUBLIC_MINIO_PUBLIC_URL` - Public URL for MinIO access

#### Optional

- `NEXT_PUBLIC_PRODUCTION_DOMAIN` - Production domain for CORS and security headers
- OAuth provider credentials (Google, GitHub, LinkedIn)
- Polar payment configuration (see [Polar Payment Integration](#polar-payment-integration))

### Docker Deployment

1. Build the Docker image:

```bash
docker build -t resume-constructor .
```

2. Run with Docker Compose:

```bash
docker-compose up -d
```

### Dokploy Deployment

1. **Create a new application** in Dokploy
2. **Configure environment variables** via Dokploy UI (use values from `.env.example`)
3. **Set up health check** endpoint: `/api/health`
4. **Configure domain** and SSL certificates
5. **Deploy** the application

#### Health Check

The application exposes a health check endpoint at `/api/health` that checks:
- Database connectivity
- MinIO storage connectivity

Dokploy will use this endpoint to monitor application health.

### Database Migrations

Before deploying, ensure database migrations are up to date:

```bash
npm run db:generate  # Generate migration files
npm run db:push      # Apply migrations
```

For production, run migrations as part of your deployment process or manually:

```bash
npm run db:migrate
```

### Security Features

- ✅ Security headers (CSP, HSTS, X-Frame-Options, etc.)
- ✅ Rate limiting on API endpoints
- ✅ Input validation and sanitization
- ✅ File upload validation (magic number checking)
- ✅ Secure cookie configuration
- ✅ CSRF protection
- ✅ Environment variable validation

### Performance Optimizations

- ✅ Database connection pooling
- ✅ Image optimization (WebP conversion)
- ✅ Next.js production optimizations
- ✅ Response compression
- ✅ Optimized Docker image layers

### Monitoring

The application includes structured logging (JSON format in production) ready for log aggregation services.

Health check endpoint: `GET /api/health`

### Troubleshooting

#### Database Connection Issues

- Verify `DATABASE_URL` is correct
- Check PostgreSQL is accessible from your deployment
- Ensure SSL mode matches your database configuration

#### MinIO Connection Issues

- Verify MinIO endpoint and port are correct
- Check MinIO credentials
- Ensure bucket exists or application has permissions to create it

#### Authentication Issues

- Verify `BETTER_AUTH_SECRET` is set and at least 32 characters
- Check `BETTER_AUTH_URL` matches your deployment URL
- Verify OAuth redirect URIs are configured correctly in provider settings

#### Build Failures

- Ensure all required environment variables are set
- Check Node.js version (requires Node 20+)
- Verify all dependencies are installed

### Development Scripts

- `npm run dev` - Start development server
- `npm run backend:dev` - Start the independent backend service on port 4000
- `npm run backend:start` - Run the independent backend service once
- `npm run backend:typecheck` - Type-check backend sources
- `npm run backend:test` - Run backend Vitest checks
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:push` - Push database schema changes
- `npm run db:studio` - Open Drizzle Studio
- `npm run db:generate` - Generate migration files
- `npm run db:migrate` - Run migrations

## Independent Backend (In Progress)

The repository now includes a standalone backend implementation under `backend/`.

### Current backend scope

- Better Auth mounted in Fastify
- Health checks
- Resume list / load / create / update / delete APIs
- Shared API contracts in `packages/contracts/`

### Local backend environment

The backend reads the existing database/auth variables and also supports:

- `INDEPENDENT_BACKEND_URL` - internal backend origin, defaults to `http://localhost:4000`
- `FRONTEND_ORIGIN` - trusted frontend origin for auth/CORS
- `AUTH_PUBLIC_URL` - public auth base URL used by Better Auth callbacks

### Compatibility rollout

The existing Next.js route handlers for:

- `/api/auth/*`
- `/api/health`
- `/api/resume`
- `/api/resume/list`

have been reduced to thin proxies, so the frontend can continue calling the same URLs while the real logic executes inside the independent backend service.

## Polar Payment Integration

This application integrates with [Polar](https://polar.sh) for subscription-based payments. Users can create and edit CVs for free, but need an active subscription to download PDFs.

### Setup

1. **Create a Polar account** at [polar.sh](https://polar.sh)
2. **Create a product and price** in your Polar dashboard
3. **Get your credentials**:
   - Access Token (for API operations)
   - Webhook Secret (for verifying webhook signatures)
   - Organization ID
   - Product Price ID (the subscription price you want to use)

4. **Configure environment variables**:
   ```bash
   POLAR_ACCESS_TOKEN=your-polar-access-token
   POLAR_WEBHOOK_SECRET=your-polar-webhook-secret
   POLAR_ORGANIZATION_ID=your-polar-organization-id
   POLAR_PRODUCT_PRICE_ID=your-polar-product-price-id
   ```

5. **Set up webhook endpoint**:
   - In your Polar dashboard, configure the webhook URL: `https://yourdomain.com/api/subscription/webhook`
   - Use the webhook secret from step 3

6. **Run database migrations** to create subscription tables:
   ```bash
   npm run db:push
   ```

### How It Works

- **Free tier**: Users can create, edit, and preview resumes
- **Subscription required**: PDF downloads require an active subscription
- **Automatic sync**: Webhooks automatically sync subscription status
- **Graceful degradation**: If Polar is not configured, the app works without payment features

### Subscription Status

Users can see their subscription status on the dashboard. The system checks subscription status before allowing PDF downloads.

### Webhook Events Handled

- `checkout.completed` - Creates customer record when checkout completes
- `subscription.created` / `subscription.updated` - Syncs subscription status
- `subscription.canceled` - Marks subscription as canceled
- `customer.created` / `customer.updated` - Updates customer information

### Testing

For testing, you can use Polar's test mode. Set up test products and use test payment methods. The webhook handler will process test events the same way as production events.

## Security Best Practices

1. **Never commit `.env` files** - Use `.env.example` as a template
2. **Use strong secrets** - Generate secure random strings for `BETTER_AUTH_SECRET`
3. **Enable HTTPS** - Always use SSL/TLS in production
4. **Regular updates** - Keep dependencies up to date
5. **Monitor logs** - Set up log aggregation and monitoring
6. **Database backups** - Implement regular backup strategy
7. **MinIO security** - Use strong credentials and restrict access

## License

[Your License Here]
