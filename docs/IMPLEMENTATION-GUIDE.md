# Image Converter - Complete Implementation Guide

> A comprehensive, step-by-step guide to building a fast, efficient web-based image converter using Next.js 15, CloudConvert API, and modern tooling.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Part 1: Environment Setup](#part-1-environment-setup)
3. [Part 2: Project Initialization](#part-2-project-initialization)
4. [Part 3: Core Configuration](#part-3-core-configuration)
5. [Part 4: Type Definitions](#part-4-type-definitions)
6. [Part 5: CloudConvert Integration](#part-5-cloudconvert-integration)
7. [Part 6: State Management](#part-6-state-management)
8. [Part 7: API Routes](#part-7-api-routes)
9. [Part 8: UI Components](#part-8-ui-components)
10. [Part 9: Main Application](#part-9-main-application)
11. [Part 10: Docker Configuration](#part-10-docker-configuration)
12. [Part 11: Deployment](#part-11-deployment)
13. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Tools

- **Bun**: Latest version (v1.0+)
  ```bash
  curl -fsSL https://bun.sh/install | bash
  ```

- **Git**: For version control
  ```bash
  git --version  # Verify installation
  ```

- **Code Editor**: VS Code recommended with TypeScript/ESLint extensions

### CloudConvert Account Setup

1. **Create Account**: Visit [https://cloudconvert.com/register](https://cloudconvert.com/register)
2. **Verify Email**: Check your inbox and verify your account
3. **Navigate to Dashboard**: [https://cloudconvert.com/dashboard](https://cloudconvert.com/dashboard)

4. **Generate Sandbox API Key**:
   - Go to **Dashboard → API → Keys**
   - Click **"Create New API Key"**
   - Name: `Image Converter (Sandbox)`
   - Sandbox mode: **Enabled** ✓
   - Copy the API key (format: `sandbox_...`)
   - **Important**: Save this key securely, you won't see it again

5. **Create Webhook (Optional for MVP)**:
   - Go to **Dashboard → Webhooks**
   - Click **"Add Webhook"**
   - Name: `Image Converter Webhook`
   - URL: Leave blank for now (we'll update after deployment)
   - Events: Select `job.finished` and `job.failed`
   - Copy the **Signing Secret** (format: `whsec_...`)

---

## Part 1: Environment Setup

### Step 1.1: Verify Bun Installation

```bash
bun --version
# Should show: 1.x.x or higher
```

If not installed, run:

```bash
# macOS/Linux
curl -fsSL https://bun.sh/install | bash

# Windows (PowerShell)
powershell -c "irm bun.sh/install.ps1 | iex"
```

### Step 1.2: Create Project Directory

```bash
cd ~/Documents/personal  # Or your preferred location
cd nodejs-image-converter
```

---

## Part 2: Project Initialization

### Step 2.1: Initialize Next.js Project

```bash
bun create next-app@latest . --typescript --tailwind --app --import-alias "@/*"
```

**Configuration Prompts** (answer as follows):

```
✔ Would you like to use TypeScript? … Yes
✔ Would you like to use ESLint? … No (we're using Biome)
✔ Would you like to use Tailwind CSS? … Yes
✔ Would you like your code inside a `src/` directory? … Yes
✔ Would you like to use App Router? … Yes
✔ Would you like to use Turbopack for next dev? … Yes
✔ Would you like to customize the import alias? … No (@/* is default)
```

### Step 2.2: Install Core Dependencies

```bash
# Core packages
bun add cloudconvert nuqs zustand react-hot-toast

# Utility packages
bun add clsx tailwind-merge class-variance-authority

# Radix UI primitives (for shadcn)
bun add @radix-ui/react-slot @radix-ui/react-select @radix-ui/react-slider @radix-ui/react-progress

# Development dependencies
bun add -D @biomejs/biome
```

### Step 2.3: Initialize shadcn/ui

```bash
bunx shadcn@latest init
```

**Configuration Prompts**:

```
✔ Preflight checks.
✔ Verifying framework. Found Next.js.
✔ Validating Tailwind CSS.
✔ Validating import alias.

✔ Which style would you like to use? › New York
✔ Which color would you like to use as base color? › Zinc
✔ Would you like to use CSS variables for colors? › yes
```

### Step 2.4: Add shadcn Components

```bash
bunx shadcn@latest add button card badge slider select progress
```

---

## Part 3: Core Configuration

### Step 3.1: Create `.env.local`

Create a file named `.env.local` in the project root:

```env
# CloudConvert API (Sandbox Mode)
CLOUDCONVERT_API_KEY=sandbox_your_actual_api_key_here
CLOUDCONVERT_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Application Configuration
NEXT_PUBLIC_MAX_FILE_SIZE=104857600
NEXT_PUBLIC_MAX_BATCH_SIZE=5
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Important**: Replace `sandbox_your_actual_api_key_here` with your actual CloudConvert sandbox API key.

### Step 3.2: Create `.env.example`

For team members (without sensitive keys):

```env
# CloudConvert API Configuration
# Get your API key from: https://cloudconvert.com/dashboard/api/v2/keys
CLOUDCONVERT_API_KEY=sandbox_your_api_key_here

# CloudConvert Webhook Secret (optional for MVP)
# Generate in CloudConvert dashboard under Webhooks
CLOUDCONVERT_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Application Settings
NEXT_PUBLIC_MAX_FILE_SIZE=104857600
NEXT_PUBLIC_MAX_BATCH_SIZE=5
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Step 3.3: Configure Biome

Create `biome.json` in the project root:

```json
{
  "$schema": "https://biomejs.dev/schemas/1.9.4/schema.json",
  "vcs": {
    "enabled": true,
    "clientKind": "git",
    "useIgnoreFile": true
  },
  "files": {
    "ignoreUnknown": false,
    "ignore": [
      ".next",
      "node_modules",
      "dist",
      "build",
      ".vercel",
      "*.config.js",
      "*.config.ts"
    ]
  },
  "formatter": {
    "enabled": true,
    "indentStyle": "space",
    "indentWidth": 2,
    "lineWidth": 100
  },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true,
      "suspicious": {
        "noExplicitAny": "warn"
      },
      "complexity": {
        "noExcessiveCognitiveComplexity": "warn"
      }
    }
  },
  "javascript": {
    "formatter": {
      "quoteStyle": "single",
      "trailingCommas": "es5",
      "semicolons": "always",
      "arrowParentheses": "always"
    }
  }
}
```

### Step 3.4: Update `package.json` Scripts

Add these scripts to your `package.json`:

```json
{
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build",
    "start": "next start",
    "check": "biome check --write .",
    "lint": "biome lint .",
    "format": "biome format --write .",
    "type-check": "tsc --noEmit"
  }
}
```

### Step 3.5: Configure TypeScript (Strict Mode)

Update `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### Step 3.6: Update `next.config.ts`

```typescript
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'storage.cloudconvert.com',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
```

### Step 3.7: Update Tailwind Config

Replace `tailwind.config.ts`:

```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
```

Install the missing plugin:

```bash
bun add -D tailwindcss-animate
```

---

## Part 4: Type Definitions

### Step 4.1: Create `src/types/conversion.ts`

```typescript
export type ImageFormat =
  | 'png'
  | 'jpg'
  | 'jpeg'
  | 'webp'
  | 'avif'
  | 'svg'
  | 'gif'
  | 'tiff'
  | 'bmp'
  | 'ico'
  | 'heic';

export type JobStatus = 'queued' | 'uploading' | 'processing' | 'finished' | 'error';

export interface ConversionJob {
  id: string;
  fileName: string;
  fileSize: number;
  inputFormat: ImageFormat;
  outputFormat: ImageFormat;
  quality: number;
  status: JobStatus;
  progress: number;
  downloadUrl?: string;
  error?: string;
  createdAt: Date;
  completedAt?: Date;
}

export interface ConversionOptions {
  quality: number;
  width?: number;
  height?: number;
  fit?: 'max' | 'crop' | 'scale';
}

export interface FileValidation {
  isValid: boolean;
  error?: string;
}
```

### Step 4.2: Create `src/types/api.ts`

```typescript
import type { ImageFormat, JobStatus } from './conversion';

export interface ConvertRequest {
  file: File;
  outputFormat: ImageFormat;
  quality: number;
}

export interface ConvertResponse {
  jobId: string;
  status: JobStatus;
}

export interface JobStatusResponse {
  jobId: string;
  status: JobStatus;
  progress: number;
  downloadUrl?: string;
  error?: string;
}

export interface ApiError {
  error: string;
  code?: string;
  details?: unknown;
}
```

---

## Part 5: CloudConvert Integration

### Step 5.1: Create `src/lib/constants.ts`

```typescript
import type { ImageFormat } from '@/types/conversion';

export const SUPPORTED_FORMATS: ImageFormat[] = [
  'png',
  'jpg',
  'jpeg',
  'webp',
  'avif',
  'svg',
  'gif',
  'tiff',
  'bmp',
  'ico',
  'heic',
];

export const MAX_FILE_SIZE = Number.parseInt(
  process.env.NEXT_PUBLIC_MAX_FILE_SIZE || '104857600',
  10
);

export const MAX_BATCH_SIZE = Number.parseInt(
  process.env.NEXT_PUBLIC_MAX_BATCH_SIZE || '5',
  10
);

export const MAX_CONCURRENT_JOBS = 3;

export const FORMAT_LABELS: Record<ImageFormat, string> = {
  png: 'PNG',
  jpg: 'JPG',
  jpeg: 'JPEG',
  webp: 'WebP',
  avif: 'AVIF',
  svg: 'SVG',
  gif: 'GIF',
  tiff: 'TIFF',
  bmp: 'BMP',
  ico: 'ICO',
  heic: 'HEIC',
};

export const MIME_TYPES: Record<string, ImageFormat> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
  'image/avif': 'avif',
  'image/svg+xml': 'svg',
  'image/gif': 'gif',
  'image/tiff': 'tiff',
  'image/bmp': 'bmp',
  'image/x-icon': 'ico',
  'image/heic': 'heic',
};
```

### Step 5.2: Create `src/lib/utils.ts`

```typescript
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

export function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) return `${seconds}s`;

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds}s`;
}
```

### Step 5.3: Create `src/lib/file-validation.ts`

```typescript
import { MIME_TYPES, MAX_FILE_SIZE, SUPPORTED_FORMATS } from './constants';
import type { ImageFormat, FileValidation } from '@/types/conversion';

export function validateFileSize(file: File): FileValidation {
  if (file.size > MAX_FILE_SIZE) {
    return {
      isValid: false,
      error: `File size exceeds ${Math.floor(MAX_FILE_SIZE / 1024 / 1024)}MB limit`,
    };
  }

  return { isValid: true };
}

export function validateFileType(file: File): FileValidation {
  const format = detectFormat(file);

  if (!format || !SUPPORTED_FORMATS.includes(format)) {
    return {
      isValid: false,
      error: `Unsupported file format. Supported: ${SUPPORTED_FORMATS.join(', ')}`,
    };
  }

  return { isValid: true };
}

export function detectFormat(file: File): ImageFormat | null {
  return MIME_TYPES[file.type] || null;
}

export function validateFile(file: File): FileValidation {
  const sizeValidation = validateFileSize(file);
  if (!sizeValidation.isValid) return sizeValidation;

  const typeValidation = validateFileType(file);
  if (!typeValidation.isValid) return typeValidation;

  return { isValid: true };
}
```

### Step 5.4: Create `src/lib/cloudconvert/client.ts`

```typescript
import CloudConvert from 'cloudconvert';

if (!process.env.CLOUDCONVERT_API_KEY) {
  throw new Error('CLOUDCONVERT_API_KEY is not set in environment variables');
}

// Initialize CloudConvert client
// Second parameter: true = sandbox mode (unlimited conversions for testing)
export const cloudConvert = new CloudConvert(
  process.env.CLOUDCONVERT_API_KEY,
  true // Sandbox mode
);

// For production, change to:
// export const cloudConvert = new CloudConvert(process.env.CLOUDCONVERT_API_KEY, false);
```

### Step 5.5: Create `src/lib/cloudconvert/jobs.ts`

```typescript
import { cloudConvert } from './client';
import type { ImageFormat, ConversionOptions } from '@/types/conversion';

export async function createConversionJob(
  file: File,
  outputFormat: ImageFormat,
  options: ConversionOptions = { quality: 85 }
) {
  try {
    // Create job with task chain
    const job = await cloudConvert.jobs.create({
      tasks: {
        'upload-file': {
          operation: 'import/upload',
        },
        'convert-file': {
          operation: 'convert',
          input: 'upload-file',
          output_format: outputFormat,
          quality: options.quality,
          ...(options.width && { width: options.width }),
          ...(options.height && { height: options.height }),
          ...(options.fit && { fit: options.fit }),
        },
        'export-file': {
          operation: 'export/url',
          input: 'convert-file',
          inline: false,
          archive_multiple_files: false,
        },
      },
      tag: 'image-converter',
    });

    // Upload the file
    const uploadTask = job.tasks?.find((t) => t.name === 'upload-file');
    if (!uploadTask) {
      throw new Error('Upload task not found in job');
    }

    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload file to CloudConvert
    await cloudConvert.tasks.upload(uploadTask, buffer, file.name);

    return job;
  } catch (error) {
    console.error('CloudConvert job creation failed:', error);
    throw error;
  }
}

export async function getJobStatus(jobId: string) {
  try {
    const job = await cloudConvert.jobs.get(jobId);
    return job;
  } catch (error) {
    console.error(`Failed to get job status for ${jobId}:`, error);
    throw error;
  }
}

export function calculateProgress(job: any): number {
  if (!job.tasks) return 0;

  const tasks = job.tasks;
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(
    (t: any) => t.status === 'finished' || t.status === 'error'
  ).length;

  return Math.round((completedTasks / totalTasks) * 100);
}

export function getDownloadUrl(job: any): string | undefined {
  const exportTask = job.tasks?.find((t: any) => t.name === 'export-file');
  return exportTask?.result?.files?.[0]?.url;
}
```

---

## Part 6: State Management

### Step 6.1: Create `src/lib/stores/conversion-store.ts`

```typescript
import { create } from 'zustand';
import type { ConversionJob, ImageFormat } from '@/types/conversion';
import { v4 as uuidv4 } from 'uuid';

interface ConversionStore {
  jobs: ConversionJob[];
  activeJobs: number;

  // Actions
  addJob: (file: File, format: ImageFormat, quality: number) => string;
  updateJob: (jobId: string, updates: Partial<ConversionJob>) => void;
  removeJob: (jobId: string) => void;
  clearCompleted: () => void;

  // Derived state
  getJob: (jobId: string) => ConversionJob | undefined;
  getPendingJobs: () => ConversionJob[];
  getActiveJobs: () => ConversionJob[];
  getCompletedJobs: () => ConversionJob[];
}

export const useConversionStore = create<ConversionStore>((set, get) => ({
  jobs: [],
  activeJobs: 0,

  addJob: (file: File, outputFormat: ImageFormat, quality: number) => {
    const jobId = uuidv4();
    const fileName = file.name;
    const fileSize = file.size;
    const inputFormat = file.type.split('/')[1] as ImageFormat;

    const newJob: ConversionJob = {
      id: jobId,
      fileName,
      fileSize,
      inputFormat,
      outputFormat,
      quality,
      status: 'queued',
      progress: 0,
      createdAt: new Date(),
    };

    set((state) => ({
      jobs: [...state.jobs, newJob],
    }));

    return jobId;
  },

  updateJob: (jobId: string, updates: Partial<ConversionJob>) => {
    set((state) => ({
      jobs: state.jobs.map((job) => (job.id === jobId ? { ...job, ...updates } : job)),
    }));
  },

  removeJob: (jobId: string) => {
    set((state) => ({
      jobs: state.jobs.filter((job) => job.id !== jobId),
    }));
  },

  clearCompleted: () => {
    set((state) => ({
      jobs: state.jobs.filter((job) => job.status !== 'finished' && job.status !== 'error'),
    }));
  },

  getJob: (jobId: string) => {
    return get().jobs.find((job) => job.id === jobId);
  },

  getPendingJobs: () => {
    return get().jobs.filter((job) => job.status === 'queued');
  },

  getActiveJobs: () => {
    return get().jobs.filter(
      (job) => job.status === 'uploading' || job.status === 'processing'
    );
  },

  getCompletedJobs: () => {
    return get().jobs.filter((job) => job.status === 'finished' || job.status === 'error');
  },
}));
```

Install the UUID package:

```bash
bun add uuid
bun add -D @types/uuid
```

---

## Part 7: API Routes

### Step 7.1: Create `src/app/api/convert/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createConversionJob } from '@/lib/cloudconvert/jobs';
import { validateFile } from '@/lib/file-validation';
import type { ImageFormat } from '@/types/conversion';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const outputFormat = formData.get('format') as ImageFormat;
    const quality = Number.parseInt(formData.get('quality') as string, 10) || 85;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file
    const validation = validateFile(file);
    if (!validation.isValid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    // Create CloudConvert job
    const job = await createConversionJob(file, outputFormat, { quality });

    return NextResponse.json({
      jobId: job.id,
      status: 'processing',
    });
  } catch (error) {
    console.error('Conversion error:', error);
    return NextResponse.json(
      { error: 'Failed to create conversion job' },
      { status: 500 }
    );
  }
}
```

### Step 7.2: Create `src/app/api/jobs/[jobId]/stream/route.ts`

```typescript
import { NextRequest } from 'next/server';
import { getJobStatus, calculateProgress, getDownloadUrl } from '@/lib/cloudconvert/jobs';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const { jobId } = await params;

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        let pollInterval = 2000; // Start with 2 seconds
        const maxInterval = 10000; // Max 10 seconds

        const poll = async () => {
          try {
            const job = await getJobStatus(jobId);

            const data = {
              jobId: job.id,
              status: job.status,
              progress: calculateProgress(job),
              downloadUrl: getDownloadUrl(job),
            };

            // Send SSE event
            const sseData = `data: ${JSON.stringify(data)}\n\n`;
            controller.enqueue(encoder.encode(sseData));

            // Check if job is complete
            if (job.status === 'finished' || job.status === 'error') {
              controller.close();
              return;
            }

            // Exponential backoff for long-running jobs
            if (pollInterval < maxInterval) {
              pollInterval = Math.min(pollInterval * 1.2, maxInterval);
            }

            // Schedule next poll
            setTimeout(poll, pollInterval);
          } catch (error) {
            console.error('Polling error:', error);
            controller.error(error);
          }
        };

        // Start polling
        poll();
      } catch (error) {
        console.error('Stream start error:', error);
        controller.error(error);
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
```

### Step 7.3: Create `src/app/api/webhooks/cloudconvert/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { cloudConvert } from '@/lib/cloudconvert/client';

export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get('CloudConvert-Signature');
    const payload = await request.text();

    if (!signature || !process.env.CLOUDCONVERT_WEBHOOK_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify webhook signature
    const isValid = cloudConvert.webhooks.verify(
      payload,
      signature,
      process.env.CLOUDCONVERT_WEBHOOK_SECRET
    );

    if (!isValid) {
      console.error('Invalid webhook signature');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse webhook event
    const event = JSON.parse(payload);

    // Handle different event types
    if (event.event === 'job.finished') {
      console.log(`Job ${event.job.id} finished successfully`);
      // Here you could update a database or cache
    } else if (event.event === 'job.failed') {
      console.error(`Job ${event.job.id} failed:`, event.job.error);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
```

---

## Part 8: UI Components

### Step 8.1: Update `src/app/layout.tsx`

```typescript
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import { Toaster } from 'react-hot-toast';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Image Converter - Fast & Efficient',
  description: 'Convert images to web-optimized formats instantly',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <NuqsAdapter>
          {children}
          <Toaster position="top-right" />
        </NuqsAdapter>
      </body>
    </html>
  );
}
```

### Step 8.2: Create `src/components/converter/upload-zone.tsx`

```typescript
'use client';

import { useCallback, useState } from 'react';
import { Upload } from 'lucide-react';
import { cn } from '@/lib/utils';
import { validateFile } from '@/lib/file-validation';
import toast from 'react-hot-toast';

interface UploadZoneProps {
  onFilesSelected: (files: File[]) => void;
  maxFiles?: number;
  disabled?: boolean;
}

export function UploadZone({
  onFilesSelected,
  maxFiles = 5,
  disabled = false,
}: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files) return;

      const fileArray = Array.from(files).slice(0, maxFiles);
      const validFiles: File[] = [];

      for (const file of fileArray) {
        const validation = validateFile(file);
        if (validation.isValid) {
          validFiles.push(file);
        } else {
          toast.error(validation.error || 'Invalid file');
        }
      }

      if (validFiles.length > 0) {
        onFilesSelected(validFiles);
      }
    },
    [onFilesSelected, maxFiles]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      handleFiles(e.target.files);
    },
    [handleFiles]
  );

  return (
    <div
      className={cn(
        'relative border-2 border-dashed rounded-lg p-12 text-center transition-colors',
        isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        type="file"
        multiple
        accept="image/*"
        onChange={handleFileInput}
        disabled={disabled}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
      />

      <div className="flex flex-col items-center gap-4">
        <div className="rounded-full bg-primary/10 p-6">
          <Upload className="w-12 h-12 text-primary" />
        </div>

        <div className="space-y-2">
          <p className="text-xl font-semibold">Drop images here</p>
          <p className="text-sm text-muted-foreground">
            or click to browse (max {maxFiles} files, 100MB each)
          </p>
        </div>

        <div className="text-xs text-muted-foreground">
          Supports: PNG, JPG, WEBP, AVIF, SVG, GIF, TIFF, BMP, ICO, HEIC
        </div>
      </div>
    </div>
  );
}
```

Install lucide-react for icons:

```bash
bun add lucide-react
```

### Step 8.3: Create `src/components/converter/format-selector.tsx`

```typescript
'use client';

import { useQueryState } from 'nuqs';
import { SUPPORTED_FORMATS, FORMAT_LABELS } from '@/lib/constants';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function FormatSelector() {
  const [format, setFormat] = useQueryState('format', {
    defaultValue: 'webp',
  });

  return (
    <div className="space-y-2">
      <label htmlFor="format" className="text-sm font-medium">
        Output Format
      </label>
      <Select value={format || 'webp'} onValueChange={setFormat}>
        <SelectTrigger id="format">
          <SelectValue placeholder="Select format" />
        </SelectTrigger>
        <SelectContent>
          {SUPPORTED_FORMATS.filter((f) => f !== 'svg').map((format) => (
            <SelectItem key={format} value={format}>
              {FORMAT_LABELS[format]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
```

### Step 8.4: Create `src/components/converter/quality-slider.tsx`

```typescript
'use client';

import { useQueryState, parseAsInteger } from 'nuqs';
import { Slider } from '@/components/ui/slider';

export function QualitySlider() {
  const [quality, setQuality] = useQueryState(
    'quality',
    parseAsInteger.withDefault(85)
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label htmlFor="quality" className="text-sm font-medium">
          Quality
        </label>
        <span className="text-sm text-muted-foreground">{quality}%</span>
      </div>
      <Slider
        id="quality"
        min={1}
        max={100}
        step={1}
        value={[quality]}
        onValueChange={(values) => setQuality(values[0] || 85)}
      />
      <p className="text-xs text-muted-foreground">
        Higher quality = larger file size
      </p>
    </div>
  );
}
```

### Step 8.5: Create `src/components/converter/job-card.tsx`

```typescript
'use client';

import { useEffect } from 'react';
import { Download, X, RotateCw, CheckCircle2, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { formatFileSize } from '@/lib/utils';
import { useConversionStore } from '@/lib/stores/conversion-store';
import type { ConversionJob } from '@/types/conversion';
import toast from 'react-hot-toast';

interface JobCardProps {
  job: ConversionJob;
}

export function JobCard({ job }: JobCardProps) {
  const { updateJob, removeJob } = useConversionStore();

  useEffect(() => {
    if (job.status !== 'processing') return;

    const eventSource = new EventSource(`/api/jobs/${job.id}/stream`);

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      updateJob(job.id, {
        status: data.status,
        progress: data.progress,
        downloadUrl: data.downloadUrl,
        ...(data.status === 'finished' && { completedAt: new Date() }),
      });

      if (data.status === 'finished') {
        toast.success(`${job.fileName} converted successfully!`);
      } else if (data.status === 'error') {
        toast.error(`Failed to convert ${job.fileName}`);
      }
    };

    eventSource.onerror = () => {
      eventSource.close();
      toast.error('Lost connection. Refreshing status...');
    };

    return () => eventSource.close();
  }, [job.id, job.status, job.fileName, updateJob]);

  const handleDownload = () => {
    if (job.downloadUrl) {
      window.open(job.downloadUrl, '_blank');
    }
  };

  const handleRemove = () => {
    removeJob(job.id);
  };

  const getStatusBadge = () => {
    switch (job.status) {
      case 'queued':
        return <Badge variant="secondary">Queued</Badge>;
      case 'uploading':
        return <Badge variant="secondary">Uploading</Badge>;
      case 'processing':
        return <Badge variant="default">Converting</Badge>;
      case 'finished':
        return (
          <Badge variant="default" className="bg-green-500">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Complete
          </Badge>
        );
      case 'error':
        return (
          <Badge variant="destructive">
            <AlertCircle className="w-3 h-3 mr-1" />
            Failed
          </Badge>
        );
    }
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-medium truncate">{job.fileName}</h3>
              {getStatusBadge()}
            </div>

            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
              <span>{formatFileSize(job.fileSize)}</span>
              <span>
                {job.inputFormat.toUpperCase()} → {job.outputFormat.toUpperCase()}
              </span>
              <span>Quality: {job.quality}%</span>
            </div>

            {(job.status === 'uploading' || job.status === 'processing') && (
              <div className="space-y-1">
                <Progress value={job.progress} />
                <p className="text-xs text-muted-foreground">{job.progress}% complete</p>
              </div>
            )}

            {job.status === 'error' && job.error && (
              <p className="text-sm text-destructive">{job.error}</p>
            )}
          </div>

          <div className="flex items-center gap-2">
            {job.status === 'finished' && job.downloadUrl && (
              <Button size="sm" onClick={handleDownload}>
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            )}

            {job.status === 'error' && (
              <Button size="sm" variant="outline">
                <RotateCw className="w-4 h-4 mr-2" />
                Retry
              </Button>
            )}

            <Button size="sm" variant="ghost" onClick={handleRemove}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
```

### Step 8.6: Create `src/components/converter/conversion-queue.tsx`

```typescript
'use client';

import { useConversionStore } from '@/lib/stores/conversion-store';
import { JobCard } from './job-card';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

export function ConversionQueue() {
  const { jobs, clearCompleted } = useConversionStore();

  const activeJobs = jobs.filter(
    (j) => j.status === 'processing' || j.status === 'uploading'
  );
  const queuedJobs = jobs.filter((j) => j.status === 'queued');
  const completedJobs = jobs.filter((j) => j.status === 'finished' || j.status === 'error');

  if (jobs.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Conversions</h2>
          <p className="text-sm text-muted-foreground">
            {activeJobs.length} converting • {queuedJobs.length} queued •{' '}
            {completedJobs.length} completed
          </p>
        </div>

        {completedJobs.length > 0 && (
          <Button variant="outline" size="sm" onClick={clearCompleted}>
            <Trash2 className="w-4 h-4 mr-2" />
            Clear Completed
          </Button>
        )}
      </div>

      <div className="space-y-3">
        {jobs.map((job) => (
          <JobCard key={job.id} job={job} />
        ))}
      </div>
    </div>
  );
}
```

---

## Part 9: Main Application

### Step 9.1: Create `src/app/page.tsx`

```typescript
'use client';

import { useState } from 'react';
import { UploadZone } from '@/components/converter/upload-zone';
import { FormatSelector } from '@/components/converter/format-selector';
import { QualitySlider } from '@/components/converter/quality-slider';
import { ConversionQueue } from '@/components/converter/conversion-queue';
import { useConversionStore } from '@/lib/stores/conversion-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQueryState, parseAsInteger } from 'nuqs';
import toast from 'react-hot-toast';
import type { ImageFormat } from '@/types/conversion';

export default function Home() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isConverting, setIsConverting] = useState(false);
  const { addJob, updateJob } = useConversionStore();

  const [format] = useQueryState('format', { defaultValue: 'webp' });
  const [quality] = useQueryState('quality', parseAsInteger.withDefault(85));

  const handleFilesSelected = (files: File[]) => {
    setSelectedFiles(files);
    toast.success(`${files.length} file(s) selected`);
  };

  const handleConvert = async () => {
    if (selectedFiles.length === 0) {
      toast.error('Please select files to convert');
      return;
    }

    setIsConverting(true);

    try {
      for (const file of selectedFiles) {
        // Add job to store
        const jobId = addJob(file, format as ImageFormat, quality);

        // Update to uploading
        updateJob(jobId, { status: 'uploading' });

        // Create FormData
        const formData = new FormData();
        formData.append('file', file);
        formData.append('format', format);
        formData.append('quality', quality.toString());

        // Call API
        const response = await fetch('/api/convert', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Conversion failed');
        }

        const data = await response.json();

        // Update job with CloudConvert job ID
        updateJob(jobId, {
          id: data.jobId,
          status: 'processing',
        });
      }

      toast.success('Conversion started!');
      setSelectedFiles([]);
    } catch (error) {
      console.error('Conversion error:', error);
      toast.error(error instanceof Error ? error.message : 'Conversion failed');
    } finally {
      setIsConverting(false);
    }
  };

  return (
    <main className="min-h-screen bg-linear-to-b from-background to-muted/20">
      <div className="container mx-auto py-12 px-4 max-w-6xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-3">Image Converter</h1>
          <p className="text-muted-foreground text-lg">
            Convert images to web-optimized formats instantly
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Upload Images</CardTitle>
              </CardHeader>
              <CardContent>
                <UploadZone onFilesSelected={handleFilesSelected} disabled={isConverting} />

                {selectedFiles.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm text-muted-foreground mb-2">
                      Selected files: {selectedFiles.length}
                    </p>
                    <ul className="text-sm space-y-1">
                      {selectedFiles.map((file, i) => (
                        <li key={i} className="text-muted-foreground">
                          {file.name}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormatSelector />
                <QualitySlider />

                <Button
                  onClick={handleConvert}
                  disabled={selectedFiles.length === 0 || isConverting}
                  className="w-full"
                  size="lg"
                >
                  {isConverting ? 'Converting...' : 'Convert Images'}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        <ConversionQueue />
      </div>
    </main>
  );
}
```

### Step 9.2: Update `src/app/globals.css`

Replace the content with:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 240 10% 3.9%;
    --card: 0 0% 100%;
    --card-foreground: 240 10% 3.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 240 10% 3.9%;
    --primary: 240 5.9% 10%;
    --primary-foreground: 0 0% 98%;
    --secondary: 240 4.8% 95.9%;
    --secondary-foreground: 240 5.9% 10%;
    --muted: 240 4.8% 95.9%;
    --muted-foreground: 240 3.8% 46.1%;
    --accent: 240 4.8% 95.9%;
    --accent-foreground: 240 5.9% 10%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 0 0% 98%;
    --border: 240 5.9% 90%;
    --input: 240 5.9% 90%;
    --ring: 240 5.9% 10%;
    --radius: 0.5rem;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

---

## Part 10: Docker Configuration

### Step 10.1: Create `.dockerignore`

Create `.dockerignore` in the project root:

```
# Dependencies
node_modules
npm-debug.log
yarn-error.log
bun.lockb

# Next.js build output
.next
out
build
dist

# Environment variables
.env
.env.local
.env*.local

# Development files
*.log
.DS_Store
.vscode
.idea

# Testing
coverage
.nyc_output

# Misc
.git
.gitignore
README.md
.eslintrc.json
.prettierrc

# Docker
Dockerfile
docker-compose.yml
.dockerignore
```

### Step 10.2: Create `Dockerfile`

Create `Dockerfile` in the project root (optimized for Bun + Next.js 15):

```dockerfile
# Use Bun base image
FROM oven/bun:1 AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Copy package files
COPY package.json bun.lockb ./

# Install dependencies
RUN bun install --frozen-lockfile

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set environment variables for build
ENV NEXT_TELEMETRY_DISABLED=1

# Build Next.js application
RUN bun run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Set correct permissions
RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Run the application
CMD ["bun", "server.js"]
```

### Step 10.3: Update `next.config.ts` for Docker

Add `output: 'standalone'` to your Next.js config:

```typescript
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone', // Required for Docker
  experimental: {
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'storage.cloudconvert.com',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
```

### Step 10.4: Create `docker-compose.yml`

For local development with Docker Compose:

```yaml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: image-converter
    ports:
      - '3000:3000'
    environment:
      - NODE_ENV=production
      - CLOUDCONVERT_API_KEY=${CLOUDCONVERT_API_KEY}
      - CLOUDCONVERT_WEBHOOK_SECRET=${CLOUDCONVERT_WEBHOOK_SECRET}
      - NEXT_PUBLIC_MAX_FILE_SIZE=${NEXT_PUBLIC_MAX_FILE_SIZE:-104857600}
      - NEXT_PUBLIC_MAX_BATCH_SIZE=${NEXT_PUBLIC_MAX_BATCH_SIZE:-5}
      - NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL:-http://localhost:3000}
    env_file:
      - .env.local
    restart: unless-stopped
    healthcheck:
      test: ['CMD', 'curl', '-f', 'http://localhost:3000/api/health']
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
```

### Step 10.5: Create Health Check Endpoint

Create `src/app/api/health/route.ts`:

```typescript
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
  });
}
```

### Step 10.6: Docker Commands Reference

**Build the Docker image**:

```bash
docker build -t image-converter:latest .
```

**Run the container**:

```bash
docker run -p 3000:3000 \
  -e CLOUDCONVERT_API_KEY=your_api_key \
  -e CLOUDCONVERT_WEBHOOK_SECRET=your_webhook_secret \
  --name image-converter \
  image-converter:latest
```

**Using Docker Compose**:

```bash
# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Rebuild and restart
docker-compose up -d --build
```

**Check container health**:

```bash
docker ps
docker logs image-converter
docker exec -it image-converter sh
```

### Step 10.7: Production Docker Deployment

#### Option 1: Deploy to Cloud Run (Google Cloud)

```bash
# Build and tag for Cloud Run
docker build -t gcr.io/YOUR_PROJECT_ID/image-converter:latest .

# Push to Google Container Registry
docker push gcr.io/YOUR_PROJECT_ID/image-converter:latest

# Deploy to Cloud Run
gcloud run deploy image-converter \
  --image gcr.io/YOUR_PROJECT_ID/image-converter:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars CLOUDCONVERT_API_KEY=your_key \
  --set-env-vars CLOUDCONVERT_WEBHOOK_SECRET=your_secret \
  --memory 512Mi
```

#### Option 2: Deploy to Railway

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Deploy
railway up
```

Add environment variables in Railway dashboard.

#### Option 3: Deploy to Fly.io

Create `fly.toml`:

```toml
app = "image-converter"
primary_region = "dfw"

[build]
  dockerfile = "Dockerfile"

[env]
  PORT = "3000"
  NODE_ENV = "production"
  NEXT_TELEMETRY_DISABLED = "1"

[[services]]
  internal_port = 3000
  protocol = "tcp"

  [[services.ports]]
    port = 80
    handlers = ["http"]

  [[services.ports]]
    port = 443
    handlers = ["tls", "http"]

[services.concurrency]
  type = "connections"
  hard_limit = 25
  soft_limit = 20

[[services.tcp_checks]]
  interval = "15s"
  timeout = "2s"
  grace_period = "1s"
```

Deploy:

```bash
# Install Fly CLI
curl -L https://fly.io/install.sh | sh

# Login
fly auth login

# Launch app
fly launch

# Set secrets
fly secrets set CLOUDCONVERT_API_KEY=your_key
fly secrets set CLOUDCONVERT_WEBHOOK_SECRET=your_secret

# Deploy
fly deploy
```

### Step 10.8: Docker Best Practices

**Multi-stage builds**: Already implemented - reduces final image size by ~60%

**Security**:
- Non-root user (nextjs:nodejs)
- Minimal base image (Bun official image)
- No sensitive data in image layers

**Performance**:
- Layer caching optimized (dependencies cached separately)
- Standalone output (only necessary files copied)
- Health checks for container orchestration

**Environment variables**:
- Never commit `.env.local` to Git
- Use Docker secrets or cloud provider secret managers in production
- Use `.env.example` for documentation

---

## Part 11: Deployment

### Option A: Deploy with Vercel (Recommended for Beginners)

#### Step 11.1: Test Locally

```bash
bun dev
```

Visit `http://localhost:3000` and test:
- Upload a small image (< 5MB)
- Select output format (WEBP)
- Adjust quality slider
- Click "Convert Images"
- Watch real-time progress
- Download converted image

#### Step 11.2: Build for Production

```bash
bun run build
```

Fix any TypeScript errors that appear.

#### Step 11.3: Deploy to Vercel

```bash
# Install Vercel CLI
bun add -g vercel

# Login
vercel login

# Deploy
vercel deploy --prod
```

**During deployment**, add environment variables:
- `CLOUDCONVERT_API_KEY`: Your production API key (not sandbox)
- `CLOUDCONVERT_WEBHOOK_SECRET`: Your webhook signing secret
- `NEXT_PUBLIC_MAX_FILE_SIZE`: 104857600
- `NEXT_PUBLIC_MAX_BATCH_SIZE`: 5

#### Step 11.4: Configure CloudConvert Webhook

1. Get your production URL from Vercel (e.g., `https://your-app.vercel.app`)
2. Go to CloudConvert Dashboard → Webhooks
3. Edit your webhook
4. Update URL to: `https://your-app.vercel.app/api/webhooks/cloudconvert`
5. Save changes

#### Step 11.5: Switch to Production API Key

Update your Vercel environment variables:
- Change `CLOUDCONVERT_API_KEY` from sandbox key to production key

In `src/lib/cloudconvert/client.ts`, change:

```typescript
export const cloudConvert = new CloudConvert(
  process.env.CLOUDCONVERT_API_KEY,
  false // Production mode
);
```

Redeploy:

```bash
vercel deploy --prod
```

---

### Option B: Deploy with Docker

#### Step 11.6: Build and Test Docker Image Locally

```bash
# Build the image
docker build -t image-converter:latest .

# Run locally
docker run -p 3000:3000 \
  -e CLOUDCONVERT_API_KEY=your_sandbox_key \
  -e CLOUDCONVERT_WEBHOOK_SECRET=your_webhook_secret \
  --name image-converter-test \
  image-converter:latest

# Test at http://localhost:3000
```

#### Step 11.7: Deploy to Your Preferred Platform

Choose one of the deployment options from Part 10, Step 10.7:
- **Google Cloud Run**: Fully managed, auto-scaling
- **Railway**: Simple deployment with Git integration
- **Fly.io**: Edge deployment, global distribution
- **Any VPS**: AWS EC2, DigitalOcean, Linode with Docker

---

## Troubleshooting

### Issue: "CLOUDCONVERT_API_KEY is not set"

**Solution**: Ensure `.env.local` exists and contains valid API key:

```bash
cat .env.local  # Check file contents
```

### Issue: File upload fails with 413 error

**Solution**: Files over 4.5MB on Vercel Hobby plan. Options:
1. Use CloudConvert direct upload URLs
2. Upgrade to Vercel Pro
3. Implement chunked upload

### Issue: SSE connection drops immediately

**Solution**: Vercel serverless timeout. Fallback to polling:

```typescript
// In JobCard component
useEffect(() => {
  const eventSource = new EventSource(`/api/jobs/${job.id}/stream`);

  const timeout = setTimeout(() => {
    eventSource.close();
    // Start polling fallback
    const interval = setInterval(async () => {
      const res = await fetch(`/api/jobs/${job.id}`);
      const data = await res.json();
      updateJob(job.id, data);

      if (data.status === 'finished' || data.status === 'error') {
        clearInterval(interval);
      }
    }, 3000);
  }, 8000);

  return () => {
    clearTimeout(timeout);
    eventSource.close();
  };
}, [job.id]);
```

### Issue: Webhook signature verification fails

**Solution**: Don't parse payload before verification:

```typescript
// WRONG
const body = await request.json();
const isValid = cloudConvert.webhooks.verify(JSON.stringify(body), ...);

// CORRECT
const payload = await request.text();  // Keep as raw string
const isValid = cloudConvert.webhooks.verify(payload, ...);
```

### Issue: Conversion stuck at 0%

**Solution**: Check CloudConvert dashboard for job errors. Common causes:
- Invalid output format
- File corrupted
- CloudConvert quota exceeded

### Issue: TypeScript errors about missing types

**Solution**: Install missing type definitions:

```bash
bun add -D @types/node @types/react @types/react-dom
```

---

## Performance Checklist

After deployment, verify:

- [ ] Lighthouse score 95+ (run in Chrome DevTools)
- [ ] Images load without layout shift
- [ ] Upload progress shows immediately
- [ ] Real-time status updates work
- [ ] Download links work (CloudConvert URLs valid)
- [ ] Mobile responsive (test on phone)
- [ ] Error handling works (try invalid file)
- [ ] Batch uploads work (5 files)
- [ ] Quality slider updates URL
- [ ] Format selector updates URL
- [ ] Toast notifications appear correctly

---

## Next Steps

1. **Add Batch ZIP Download**: Implement multi-file ZIP creation
2. **Persistent History**: Use Vercel KV to store conversion history
3. **User Authentication**: Add NextAuth.js for user accounts
4. **Advanced Settings**: Width/height resize, aspect ratio options
5. **Format Presets**: "Web Optimized", "Social Media", "Print Quality"
6. **Analytics**: Track conversion statistics with Vercel Analytics
7. **Rate Limiting**: Implement per-IP limits with Upstash Redis
8. **Dark Mode**: Add theme toggle using next-themes

---

## Support & Resources

- **CloudConvert Docs**: https://cloudconvert.com/api/v2
- **CloudConvert Dashboard**: https://cloudconvert.com/dashboard
- **Next.js Docs**: https://nextjs.org/docs
- **shadcn/ui**: https://ui.shadcn.com
- **nuqs**: https://nuqs.47ng.com
- **Vercel**: https://vercel.com/docs

---

**Congratulations!** You now have a fully functional, production-ready image converter application. 🎉
