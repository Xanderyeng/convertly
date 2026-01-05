# Image Converter

A fast, efficient web-based image converter built with Next.js 15, CloudConvert API, and modern tooling.

## Features

- 🚀 **Fast conversions**: Powered by CloudConvert API
- 📦 **Multiple formats**: PNG, JPG, WEBP, AVIF, SVG, GIF, TIFF, BMP, ICO, HEIC
- ⚡ **Real-time updates**: Server-Sent Events for live progress
- 🎨 **Quality control**: Adjustable quality slider (1-100)
- 📱 **Responsive design**: Works on desktop and mobile
- 🔄 **Batch processing**: Convert up to 5 files simultaneously
- 🐳 **Docker ready**: Easy deployment with Docker and Docker Compose

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS v4
- **Runtime**: Bun
- **Linting**: Biome
- **UI Components**: shadcn/ui
- **State Management**: Zustand + nuqs
- **Notifications**: react-hot-toast
- **API**: CloudConvert Node.js SDK
- **Deployment**: Vercel / Docker

## Quick Start

### Prerequisites

- [Bun](https://bun.sh) v1.0+
- CloudConvert account (free tier available)
- Docker & Docker Compose (for Docker deployment)

### Installation

1. **Clone the repository**:
   ```bash
   cd nodejs-image-converter
   ```

2. **Install dependencies**:
   ```bash
   bun install
   ```

3. **Set up environment variables**:
   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` and add your CloudConvert API key:
   ```env
   CLOUDCONVERT_API_KEY=sandbox_your_api_key_here
   CLOUDCONVERT_WEBHOOK_SECRET=whsec_your_webhook_secret_here
   ```

4. **Run the development server**:
   ```bash
   bun dev
   ```

5. **Open [http://localhost:3000](http://localhost:3000)** in your browser

## Docker Deployment

### Using Docker Compose (Recommended)

```bash
# Build and start
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

### Using Docker CLI

```bash
# Build image
docker build -t image-converter:latest .

# Run container
docker run -p 3000:3000 \
  -e CLOUDCONVERT_API_KEY=your_key \
  -e CLOUDCONVERT_WEBHOOK_SECRET=your_secret \
  --name image-converter \
  image-converter:latest
```

## CloudConvert Setup

1. **Create account**: [https://cloudconvert.com/register](https://cloudconvert.com/register)
2. **Generate API key**: Dashboard → API → Keys
   - Enable **Sandbox mode** for testing (unlimited conversions)
   - Switch to production key when deploying
3. **Configure webhook** (optional):
   - Dashboard → Webhooks
   - Add your webhook URL: `https://your-domain.com/api/webhooks/cloudconvert`
   - Copy the signing secret

## Project Structure

```
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── api/                 # API routes
│   │   │   ├── convert/         # Conversion endpoint
│   │   │   ├── jobs/[jobId]/    # Job status (SSE)
│   │   │   └── webhooks/        # CloudConvert webhooks
│   │   ├── layout.tsx           # Root layout (NuqsAdapter)
│   │   └── page.tsx             # Main converter UI
│   ├── components/
│   │   ├── ui/                  # shadcn components
│   │   └── converter/           # Feature components
│   ├── lib/
│   │   ├── cloudconvert/        # CloudConvert integration
│   │   ├── stores/              # Zustand stores
│   │   └── utils.ts             # Utilities
│   └── types/                   # TypeScript types
├── Dockerfile                    # Docker configuration
├── docker-compose.yml           # Docker Compose setup
└── IMPLEMENTATION-GUIDE.md      # Detailed guide
```

## Available Scripts

```bash
bun dev          # Start development server
bun build        # Build for production
bun start        # Start production server
bun check        # Run Biome linter + formatter
bun lint         # Run Biome linter only
bun format       # Run Biome formatter only
bun type-check   # TypeScript type checking
```

## Deployment

### Vercel (Recommended)

```bash
vercel deploy --prod
```

Add environment variables in Vercel dashboard:
- `CLOUDCONVERT_API_KEY` (production key)
- `CLOUDCONVERT_WEBHOOK_SECRET`

### Docker Platforms

- **Google Cloud Run**: Fully managed, auto-scaling
- **Railway**: Git-based deployment
- **Fly.io**: Edge deployment
- **VPS**: Any server with Docker

See [IMPLEMENTATION-GUIDE.md](./IMPLEMENTATION-GUIDE.md) for detailed deployment instructions.

## Configuration

### File Limits

- **Max file size**: 100MB (configurable via `NEXT_PUBLIC_MAX_FILE_SIZE`)
- **Max batch size**: 5 files (configurable via `NEXT_PUBLIC_MAX_BATCH_SIZE`)
- **Concurrent conversions**: 3 (prevents API rate limits)

### Supported Formats

**Input**: PNG, JPG, WEBP, AVIF, SVG, GIF, TIFF, BMP, ICO, HEIC
**Output**: PNG, JPG, WEBP, AVIF, GIF, TIFF, BMP, ICO, HEIC

**Note**: SVG can only be used as input (rasterized to other formats)

## Documentation

- [Complete Implementation Guide](./IMPLEMENTATION-GUIDE.md) - Step-by-step tutorial
- [Original Project Plan](./image-converter-plan.md) - Architecture details

## Performance

### Targets

- **Lighthouse Score**: 95+
- **LCP**: < 1.5s
- **FID**: < 50ms
- **CLS**: < 0.1

### Conversion Times

- **1MB**: 2-3 seconds
- **10MB**: 5-8 seconds
- **50MB**: 15-25 seconds
- **100MB**: 30-50 seconds

## Troubleshooting

### Issue: Conversion stuck at 0%

**Solution**: Check CloudConvert dashboard for job errors

### Issue: File upload fails (413 error)

**Solution**: Files over 4.5MB on Vercel Hobby plan - use streaming upload or CloudConvert direct URLs

### Issue: SSE connection drops

**Solution**: Vercel serverless timeout (10s) - fallback to polling implemented

See [IMPLEMENTATION-GUIDE.md](./IMPLEMENTATION-GUIDE.md#troubleshooting) for more solutions.

## License

MIT

## Credits

Built with:
- [Next.js](https://nextjs.org)
- [CloudConvert](https://cloudconvert.com)
- [shadcn/ui](https://ui.shadcn.com)
- [Bun](https://bun.sh)
- [Biome](https://biomejs.dev)

---

**Ready to start?** Follow the [Implementation Guide](./IMPLEMENTATION-GUIDE.md) for detailed setup instructions.
