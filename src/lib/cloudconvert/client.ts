import CloudConvert from 'cloudconvert';

if (!process.env.CLOUDCONVERT_API_KEY) {
  throw new Error('CLOUDCONVERT_API_KEY is not set in environment variables');
}

// Determine if we're in sandbox mode
const isSandbox = process.env.CLOUDCONVERT_SANDBOX === 'true';
const sandboxUrl = 'https://api.sandbox.cloudconvert.com';

// Initialize CloudConvert client
// Sandbox mode: Uses sandbox API URL for unlimited test conversions
// Production mode: Uses production API URL
export const cloudConvert = new CloudConvert(
  process.env.CLOUDCONVERT_API_KEY,
  isSandbox
);

console.log(`CloudConvert initialized in ${isSandbox ? 'SANDBOX' : 'PRODUCTION'} mode`);
if (isSandbox) {
  console.log(`Using sandbox URL: ${sandboxUrl}`);
}