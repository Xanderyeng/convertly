export type ImageFormat =
  | "png"
  | "jpg"
  | "jpeg"
  | "webp"
  | "avif"
  | "svg"
  | "gif"
  | "tiff"
  | "bmp"
  | "ico"
  | "heic";

export type JobStatus =
  | "queued"
  | "uploading"
  | "processing"
  | "finished"
  | "error";

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
  fit?: "max" | "crop" | "scale";
}

export interface FileValidation {
  isValid: boolean;
  error?: string;
}
