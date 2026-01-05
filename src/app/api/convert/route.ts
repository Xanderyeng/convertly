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