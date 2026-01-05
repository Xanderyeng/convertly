'use client';

import { useCallback, useState } from 'react';
import { Upload } from 'lucide-react';
import { cn } from '@/lib/utils';
import { validateFile } from '@/lib/file-validation';
import toast from 'react-hot-toast';

interface UploadZoneProps {
  onFilesSelected: (files: File[]) => void;
  maxFiles?: number;
  disabled?: boolean;
}

export function UploadZone({
  onFilesSelected,
  maxFiles = 5,
  disabled = false,
}: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files) return;

      const fileArray = Array.from(files).slice(0, maxFiles);
      const validFiles: File[] = [];

      for (const file of fileArray) {
        const validation = validateFile(file);
        if (validation.isValid) {
          validFiles.push(file);
        } else {
          toast.error(validation.error || 'Invalid file');
        }
      }

      if (validFiles.length > 0) {
        onFilesSelected(validFiles);
      }
    },
    [onFilesSelected, maxFiles]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      handleFiles(e.target.files);
    },
    [handleFiles]
  );

  return (
    <div
      className={cn(
        'relative border-2 border-dashed rounded-lg p-12 text-center transition-colors',
        isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        type="file"
        multiple
        accept="image/*"
        onChange={handleFileInput}
        disabled={disabled}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
      />

      <div className="flex flex-col items-center gap-4">
        <div className="rounded-full bg-primary/10 p-6">
          <Upload className="w-12 h-12 text-primary" />
        </div>

        <div className="space-y-2">
          <p className="text-xl font-semibold">Drop images here</p>
          <p className="text-sm text-muted-foreground">
            or click to browse (max {maxFiles} files, 100MB each)
          </p>
        </div>

        <div className="text-xs text-muted-foreground">
          Supports: PNG, JPG, WEBP, AVIF, SVG, GIF, TIFF, BMP, ICO, HEIC
        </div>
      </div>
    </div>
  );
}