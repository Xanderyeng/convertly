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