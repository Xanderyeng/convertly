import { NextResponse } from 'next/server';
import { cloudConvert } from '@/lib/cloudconvert/client';

/**
 * Test endpoint for CloudConvert sandbox mode
 * Uses whitelisted test files from CloudConvert
 *
 * Usage:
 * curl -X POST http://localhost:3000/api/test-sandbox
 */
export async function POST() {
  try {
    console.log('Creating sandbox test job...');

    // Use CloudConvert's whitelisted test image
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
      },
      tag: 'sandbox-test'
    });

    console.log('Sandbox test job created:', job.id);

    return NextResponse.json({
      success: true,
      jobId: job.id,
      message: 'Sandbox test job created successfully',
      testFile: 'example.jpg',
      outputFormat: 'webp',
      note: 'Monitor job status at /api/jobs/' + job.id + '/stream'
    });
  } catch (error: any) {
    console.error('Sandbox test failed:', error);

    return NextResponse.json(
      {
        error: 'Sandbox test failed',
        message: error.message || 'Unknown error',
        details: error.response?.data || error.toString(),
        hint: 'Check that CLOUDCONVERT_SANDBOX=true and your API key is valid'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'CloudConvert Sandbox Test Endpoint',
    usage: 'POST to this endpoint to create a test conversion job',
    sandbox: process.env.CLOUDCONVERT_SANDBOX === 'true',
    apiKeyPresent: !!process.env.CLOUDCONVERT_API_KEY,
    testFiles: {
      jpg: 'https://s3.amazonaws.com/cloudconvert-testfiles/example.jpg',
      png: 'https://s3.amazonaws.com/cloudconvert-testfiles/example.png',
      pdf: 'https://s3.amazonaws.com/cloudconvert-testfiles/example.pdf'
    }
  });
}
