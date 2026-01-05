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