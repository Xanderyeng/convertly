import type { ImageFormat, JobStatus } from "./conversion";

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
