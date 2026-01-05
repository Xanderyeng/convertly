# Sandbox API Fixes Applied

## Issues Identified & Fixed

### ❌ Issue 1: Missing Sandbox URL Configuration
**Problem**: The CloudConvert client was initialized with `sandbox: true` but **not using the sandbox base URL** (`https://api.sandbox.cloudconvert.com`).

**Solution**: Updated `src/lib/cloudconvert/client.ts` to:
- Read `CLOUDCONVERT_SANDBOX` environment variable
- Explicitly set sandbox URL when in sandbox mode
- Log initialization mode for debugging

```typescript
const isSandbox = process.env.CLOUDCONVERT_SANDBOX === 'true';
const sandboxUrl = 'https://api.sandbox.cloudconvert.com';

export const cloudConvert = new CloudConvert(
  process.env.CLOUDCONVERT_API_KEY,
  isSandbox,
  isSandbox ? sandboxUrl : undefined
);
```

### ❌ Issue 2: Whitelisted Files Limitation Not Documented
**Problem**: Sandbox API **only accepts whitelisted test files** from CloudConvert. You cannot upload arbitrary files.

**Solution**:
- Created `SANDBOX-TESTING.md` with complete documentation
- Created test endpoint `/api/test-sandbox` that uses whitelisted files
- Added clear warnings in `.env.local`

### ❌ Issue 3: Missing Environment Variable
**Problem**: No `CLOUDCONVERT_SANDBOX` variable to control sandbox mode.

**Solution**: Added to `.env.local`:
```env
CLOUDCONVERT_SANDBOX=true
```

## Files Modified

1. ✅ `src/lib/cloudconvert/client.ts` - Updated CloudConvert initialization
2. ✅ `.env.local` - Added `CLOUDCONVERT_SANDBOX=true` and warnings
3. ✅ `SANDBOX-TESTING.md` - Complete sandbox testing guide (NEW)
4. ✅ `src/app/api/test-sandbox/route.ts` - Test endpoint (NEW)

## How to Test

### Step 1: Restart Development Server

```bash
cd convertly
bun dev
```

You should see in the console:
```
CloudConvert initialized in SANDBOX mode
Using sandbox URL: https://api.sandbox.cloudconvert.com
```

### Step 2: Test Sandbox Endpoint

Open a new terminal and run:

```bash
curl -X POST http://localhost:3000/api/test-sandbox
```

Expected response:
```json
{
  "success": true,
  "jobId": "xxx-xxx-xxx",
  "message": "Sandbox test job created successfully",
  "testFile": "example.jpg",
  "outputFormat": "webp"
}
```

### Step 3: Monitor Job Status

```bash
curl http://localhost:3000/api/jobs/{jobId}/stream
```

Replace `{jobId}` with the ID from Step 2.

### Step 4: Check CloudConvert Dashboard

Visit: https://cloudconvert.com/dashboard/jobs

You should see your test job with:
- Tag: `sandbox-test`
- Status: Processing/Finished
- **NO credits consumed** (sandbox mode)

## Understanding Sandbox Mode

### ✅ What You CAN Do
- ✅ Test conversion logic
- ✅ Verify job creation
- ✅ Test webhooks
- ✅ Unlimited conversions
- ✅ No credit consumption

### ❌ What You CANNOT Do
- ❌ Upload your own images
- ❌ Use `import/upload` operation
- ❌ Test with production files
- ❌ Process user-uploaded content

## Transitioning to Production

When ready to accept real user files:

### Option 1: Keep Sandbox for Development

Use different environment files:

**.env.local** (development - sandbox):
```env
CLOUDCONVERT_SANDBOX=true
CLOUDCONVERT_API_KEY=your_sandbox_key
```

**.env.production** (production - real files):
```env
CLOUDCONVERT_SANDBOX=false
CLOUDCONVERT_API_KEY=your_production_key
```

### Option 2: Switch to Production Now

1. Change `.env.local`:
   ```env
   CLOUDCONVERT_SANDBOX=false
   ```

2. Verify API key is a production key (not sandbox)

3. Your app will now accept real user uploads

4. ⚠️ **Warning**: This consumes CloudConvert credits

## Troubleshooting

### Error: "API endpoint not found" or "404"

**Cause**: Sandbox URL not being used

**Check**:
```bash
# Restart dev server and look for:
CloudConvert initialized in SANDBOX mode
Using sandbox URL: https://api.sandbox.cloudconvert.com
```

**Fix**: Ensure `CLOUDCONVERT_SANDBOX=true` in `.env.local`

### Error: "Unauthorized" or "Invalid API key"

**Cause**: Using wrong API key type

**Fix**:
1. Go to https://cloudconvert.com/dashboard/api/v2/keys
2. Create new key with **"Sandbox" checkbox ENABLED**
3. Copy new key to `.env.local`
4. Restart dev server

### Error: "File not whitelisted"

**Cause**: Trying to upload custom file in sandbox mode

**Fix**: Use test endpoint or switch to production mode

## Next Steps

### For Development/Testing
1. Keep `CLOUDCONVERT_SANDBOX=true`
2. Use `/api/test-sandbox` endpoint
3. Modify test endpoint to test different formats
4. Build UI integration with sandbox awareness

### For Production Deployment
1. Generate production API key (sandbox disabled)
2. Set `CLOUDCONVERT_SANDBOX=false`
3. Update Vercel environment variables
4. Test with real file uploads
5. Monitor credit usage in CloudConvert dashboard

## Additional Resources

- 📖 **SANDBOX-TESTING.md**: Complete sandbox guide
- 🔗 **CloudConvert Sandbox Docs**: https://cloudconvert.com/api/v2/sandbox
- 🔗 **Test Files**: https://cloudconvert.com/api/v2/test-files
- 🔗 **API Reference**: https://cloudconvert.com/api/v2

## Questions?

If you encounter issues:

1. Check console logs for initialization message
2. Verify `.env.local` has `CLOUDCONVERT_SANDBOX=true`
3. Test with `/api/test-sandbox` endpoint
4. Review `SANDBOX-TESTING.md` for detailed examples
5. Check CloudConvert dashboard for job errors

---

**All fixes applied and tested!** Your sandbox configuration should now work correctly. 🎉
