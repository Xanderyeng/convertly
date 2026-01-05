import type { FileValidation, ImageFormat } from "@/types/conversion";
import { MAX_FILE_SIZE, MIME_TYPES, SUPPORTED_FORMATS } from "./constants";

export function validateFileSize(file: File): FileValidation {
  if (file.size > MAX_FILE_SIZE) {
    return {
      isValid: false,
      error: `File size exceeds ${Math.floor(MAX_FILE_SIZE / 1024 / 1024)}MB limit`,
    };
  }

  return { isValid: true };
}

export function validateFileType(file: File): FileValidation {
  const format = detectFormat(file);

  if (!format || !SUPPORTED_FORMATS.includes(format)) {
    return {
      isValid: false,
      error: `Unsupported file format. Supported: ${SUPPORTED_FORMATS.join(", ")}`,
    };
  }

  return { isValid: true };
}

export function detectFormat(file: File): ImageFormat | null {
  return MIME_TYPES[file.type] || null;
}

export function validateFile(file: File): FileValidation {
  const sizeValidation = validateFileSize(file);
  if (!sizeValidation.isValid) return sizeValidation;

  const typeValidation = validateFileType(file);
  if (!typeValidation.isValid) return typeValidation;

  return { isValid: true };
}
