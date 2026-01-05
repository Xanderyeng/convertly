"use client";

import { parseAsInteger, useQueryState } from "nuqs";
import { Suspense, useState } from "react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useConversionStore } from "@/lib/stores/conversion-store";
import type { ImageFormat } from "@/types/conversion";
import { ConversionQueue } from "./conversion-queue";
import { FormatSelector } from "./format-selector";
import { QualitySlider } from "./quality-slider";
import { UploadZone } from "./upload-zone";

function ConverterContent() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isConverting, setIsConverting] = useState(false);
  const { addJob, updateJob } = useConversionStore();

  const [format] = useQueryState("format", { defaultValue: "webp" });
  const [quality] = useQueryState("quality", parseAsInteger.withDefault(85));

  const handleFilesSelected = (files: File[]) => {
    setSelectedFiles(files);
    toast.success(`${files.length} file(s) selected`);
  };

  const handleConvert = async () => {
    if (selectedFiles.length === 0) {
      toast.error("Please select files to convert");
      return;
    }

    setIsConverting(true);

    try {
      for (const file of selectedFiles) {
        // Add job to store
        const jobId = addJob(file, format as ImageFormat, quality);

        // Update to uploading
        updateJob(jobId, { status: "uploading" });

        // Create FormData
        const formData = new FormData();
        formData.append("file", file);
        formData.append("format", format);
        formData.append("quality", quality.toString());

        // Call API
        const response = await fetch("/api/convert", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Conversion failed");
        }

        const data = await response.json();

        // Update job with CloudConvert job ID
        updateJob(jobId, {
          id: data.jobId,
          status: "processing",
        });
      }

      toast.success("Conversion started!");
      setSelectedFiles([]);
    } catch (error) {
      console.error("Conversion error:", error);
      toast.error(error instanceof Error ? error.message : "Conversion failed");
    } finally {
      setIsConverting(false);
    }
  };

  return (
    <main className="min-h-screen bg-linear-to-b from-background to-muted/20">
      <div className="container mx-auto py-12 px-4 max-w-6xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-3">Image Converter</h1>
          <p className="text-muted-foreground text-lg">
            Convert images to web-optimized formats instantly
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Upload Images</CardTitle>
              </CardHeader>
              <CardContent>
                <UploadZone
                  onFilesSelected={handleFilesSelected}
                  disabled={isConverting}
                />

                {selectedFiles.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm text-muted-foreground mb-2">
                      Selected files: {selectedFiles.length}
                    </p>
                    <ul className="text-sm space-y-1">
                      {selectedFiles.map((file) => (
                        <li key={file.name} className="text-muted-foreground">
                          {file.name}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormatSelector />
                <QualitySlider />

                <Button
                  onClick={handleConvert}
                  disabled={selectedFiles.length === 0 || isConverting}
                  className="w-full"
                  size="lg"
                >
                  {isConverting ? "Converting..." : "Convert Images"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        <ConversionQueue />
      </div>
    </main>
  );
}

export function ImageConverter() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-linear-to-b from-background to-muted/20">
          <div className="container mx-auto py-12 px-4 max-w-6xl">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold mb-3">Image Converter</h1>
              <p className="text-muted-foreground text-lg">Loading...</p>
            </div>
          </div>
        </main>
      }
    >
      <ConverterContent />
    </Suspense>
  );
}
