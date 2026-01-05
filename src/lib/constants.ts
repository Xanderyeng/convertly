import type { ImageFormat } from '@/types/conversion';

export const SUPPORTED_FORMATS: ImageFormat[] = [
  'png',
  'jpg',
  'jpeg',
  'webp',
  'avif',
  'svg',
  'gif',
  'tiff',
  'bmp',
  'ico',
  'heic',
];

export const MAX_FILE_SIZE = Number.parseInt(
  process.env.NEXT_PUBLIC_MAX_FILE_SIZE || '104857600',
  10
);

export const MAX_BATCH_SIZE = Number.parseInt(
  process.env.NEXT_PUBLIC_MAX_BATCH_SIZE || '5',
  10
);

export const MAX_CONCURRENT_JOBS = 3;

export const FORMAT_LABELS: Record<ImageFormat, string> = {
  png: 'PNG',
  jpg: 'JPG',
  jpeg: 'JPEG',
  webp: 'WebP',
  avif: 'AVIF',
  svg: 'SVG',
  gif: 'GIF',
  tiff: 'TIFF',
  bmp: 'BMP',
  ico: 'ICO',
  heic: 'HEIC',
};

export const MIME_TYPES: Record<string, ImageFormat> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
  'image/avif': 'avif',
  'image/svg+xml': 'svg',
  'image/gif': 'gif',
  'image/tiff': 'tiff',
  'image/bmp': 'bmp',
  'image/x-icon': 'ico',
  'image/heic': 'heic',
};