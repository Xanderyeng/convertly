# CloudConvert Sandbox Mode Testing Guide

## Overview

The CloudConvert Sandbox API allows **unlimited conversions** for testing, but **only accepts whitelisted test files**. You cannot upload arbitrary files in sandbox mode.

## Configuration

Your `.env.local` should have:

```env
CLOUDCONVERT_SANDBOX=true
CLOUDCONVERT_API_KEY=your_sandbox_api_key
```

**Important**: Ensure your API key is created with **"Sandbox"** enabled in the CloudConvert dashboard.

## Sandbox Limitations

### ✅ What Works
- Unlimited job executions (no credit consumption)
- All conversion operations
- Testing your integration logic
- Webhook testing

### ❌ What Doesn't Work
- **Uploading your own files** (only whitelisted files accepted)
- Using `import/upload` with custom files
- Production-scale file processing

## Whitelisted Test Files

CloudConvert provides a set of whitelisted test files you can use. Instead of uploading files, use the `import/url` operation with these URLs:

### Image Test Files

```javascript
const testFiles = {
  // PNG test image
  png: 'https://s3.amazonaws.com/cloudconvert-testfiles/example.png',

  // JPG test image
  jpg: 'https://s3.amazonaws.com/cloudconvert-testfiles/example.jpg',

  // PDF test file (can be converted to images)
  pdf: 'https://s3.amazonaws.com/cloudconvert-testfiles/example.pdf',

  // More formats available...
};
```

## How to Test in Sandbox Mode

### Option 1: Use CloudConvert Test Files (Recommended)

Update your job creation to use `import/url` instead of `import/upload`:

```typescript
// In src/lib/cloudconvert/jobs.ts
const job = await cloudConvert.jobs.create({
  tasks: {
    'import-file': {
      operation: 'import/url',
      url: 'https://s3.amazonaws.com/cloudconvert-testfiles/example.jpg',
      filename: 'test-image.jpg'
    },
    'convert-file': {
      operation: 'convert',
      input: 'import-file',
      output_format: 'webp',
      quality: 85
    },
    'export-file': {
      operation: 'export/url',
      input: 'convert-file'
    }
  }
});
```

### Option 2: Switch to Production Mode

For testing with your own files:

1. Change `.env.local`:
   ```env
   CLOUDCONVERT_SANDBOX=false
   ```

2. Use a production API key (consumes credits)

3. You'll have limited conversions based on your CloudConvert plan

## Testing Workflow

### 1. Verify Sandbox Configuration

Start your dev server and check the console:

```bash
cd convertly
bun dev
```

You should see:
```
CloudConvert initialized in SANDBOX mode
Using sandbox URL: https://api.sandbox.cloudconvert.com
```

### 2. Create Test Conversion Job

Use one of the whitelisted test files:

```bash
curl -X POST http://localhost:3000/api/convert \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://s3.amazonaws.com/cloudconvert-testfiles/example.jpg",
    "format": "webp",
    "quality": 85
  }'
```

### 3. Monitor Job Status

Check the job status via SSE:

```
http://localhost:3000/api/jobs/{jobId}/stream
```

## Common Errors & Solutions

### Error: "This file is not whitelisted for sandbox mode"

**Cause**: Trying to upload a custom file in sandbox mode

**Solution**:
- Use `import/url` with whitelisted test files, OR
- Switch to production mode (`CLOUDCONVERT_SANDBOX=false`)

### Error: "Invalid API key"

**Cause**: Using a production API key with sandbox URL

**Solution**:
- Generate a new API key with "Sandbox" enabled
- Or switch to production mode

### Error: "API endpoint not found"

**Cause**: Wrong base URL being used

**Solution**:
- Check console logs to verify sandbox URL is being used
- Restart dev server after changing `.env.local`

## Sandbox Test File Utility

Create a test API route to use whitelisted files:

```typescript
// src/app/api/test-sandbox/route.ts
import { NextResponse } from 'next/server';
import { cloudConvert } from '@/lib/cloudconvert/client';

export async function POST() {
  const job = await cloudConvert.jobs.create({
    tasks: {
      'import-file': {
        operation: 'import/url',
        url: 'https://s3.amazonaws.com/cloudconvert-testfiles/example.jpg',
        filename: 'test-image.jpg'
      },
      'convert-file': {
        operation: 'convert',
        input: 'import-file',
        output_format: 'webp',
        quality: 85
      },
      'export-file': {
        operation: 'export/url',
        input: 'convert-file'
      }
    }
  });

  return NextResponse.json({ jobId: job.id });
}
```

Test it:
```bash
curl -X POST http://localhost:3000/api/test-sandbox
```

## Transitioning to Production

When ready to deploy:

1. **Generate Production API Key**:
   - CloudConvert Dashboard → API → Keys
   - Create new key with **Sandbox DISABLED**
   - Copy the API key

2. **Update Environment Variables**:
   ```env
   CLOUDCONVERT_API_KEY=your_production_key
   CLOUDCONVERT_SANDBOX=false
   ```

3. **Restore Upload Functionality**:
   - Change back to `import/upload` operation
   - Remove test file logic

4. **Monitor Usage**:
   - Check CloudConvert dashboard for credit consumption
   - Set up usage alerts

## Additional Resources

- **CloudConvert Sandbox Docs**: https://cloudconvert.com/api/v2/sandbox
- **Test Files List**: https://cloudconvert.com/api/v2/test-files
- **API Reference**: https://cloudconvert.com/api/v2

---

**Note**: Sandbox mode is perfect for development and integration testing. For production use with real user files, you must use production mode.
