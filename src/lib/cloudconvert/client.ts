import CloudConvert from "cloudconvert";

// Lazy initialization to avoid build-time errors
let cloudConvertInstance: CloudConvert | null = null;

function getCloudConvertClient(): CloudConvert {
  if (!cloudConvertInstance) {
    // Check for API key at runtime, not at module load time
    if (!process.env.CLOUDCONVERT_API_KEY) {
      throw new Error(
        "CLOUDCONVERT_API_KEY is not set in environment variables",
      );
    }

    // Determine if we're in sandbox mode
    const isSandbox = process.env.CLOUDCONVERT_SANDBOX === "true";
    const sandboxUrl = "https://api.sandbox.cloudconvert.com";

    // Initialize CloudConvert client
    // Sandbox mode: Uses sandbox API URL for unlimited test conversions
    // Production mode: Uses production API URL
    cloudConvertInstance = new CloudConvert(
      process.env.CLOUDCONVERT_API_KEY,
      isSandbox,
    );

    console.log(
      `CloudConvert initialized in ${isSandbox ? "SANDBOX" : "PRODUCTION"} mode`,
    );
    if (isSandbox) {
      console.log(`Using sandbox URL: ${sandboxUrl}`);
    }
  }

  return cloudConvertInstance;
}

// Export a Proxy that lazily initializes the client
export const cloudConvert = new Proxy({} as CloudConvert, {
  get(_target, prop: string | symbol) {
    const client = getCloudConvertClient();
    const value = (client as unknown as Record<string | symbol, unknown>)[prop];
    return typeof value === "function" ? value.bind(client) : value;
  },
});
