"use client";

import { AlertCircle, CheckCircle2, Download, RotateCw, X } from "lucide-react";
import { useEffect } from "react";
import toast from "react-hot-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useConversionStore } from "@/lib/stores/conversion-store";
import { formatFileSize } from "@/lib/utils";
import type { ConversionJob } from "@/types/conversion";

interface JobCardProps {
  job: ConversionJob;
}

export function JobCard({ job }: JobCardProps) {
  const { updateJob, removeJob } = useConversionStore();

  useEffect(() => {
    if (job.status !== "processing") return;

    const eventSource = new EventSource(`/api/jobs/${job.id}/stream`);

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      updateJob(job.id, {
        status: data.status,
        progress: data.progress,
        downloadUrl: data.downloadUrl,
        ...(data.status === "finished" && { completedAt: new Date() }),
      });

      if (data.status === "finished") {
        toast.success(`${job.fileName} converted successfully!`);
      } else if (data.status === "error") {
        toast.error(`Failed to convert ${job.fileName}`);
      }
    };

    eventSource.onerror = () => {
      eventSource.close();
      toast.error("Lost connection. Refreshing status...");
    };

    return () => eventSource.close();
  }, [job.id, job.status, job.fileName, updateJob]);

  const handleDownload = () => {
    if (job.downloadUrl) {
      window.open(job.downloadUrl, "_blank");
    }
  };

  const handleRemove = () => {
    removeJob(job.id);
  };

  const getStatusBadge = () => {
    switch (job.status) {
      case "queued":
        return <Badge variant="secondary">Queued</Badge>;
      case "uploading":
        return <Badge variant="secondary">Uploading</Badge>;
      case "processing":
        return <Badge variant="default">Converting</Badge>;
      case "finished":
        return (
          <Badge variant="default" className="bg-green-500">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Complete
          </Badge>
        );
      case "error":
        return (
          <Badge variant="destructive">
            <AlertCircle className="w-3 h-3 mr-1" />
            Failed
          </Badge>
        );
    }
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-medium truncate">{job.fileName}</h3>
              {getStatusBadge()}
            </div>

            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
              <span>{formatFileSize(job.fileSize)}</span>
              <span>
                {job.inputFormat.toUpperCase()} →{" "}
                {job.outputFormat.toUpperCase()}
              </span>
              <span>Quality: {job.quality}%</span>
            </div>

            {(job.status === "uploading" || job.status === "processing") && (
              <div className="space-y-1">
                <Progress value={job.progress} />
                <p className="text-xs text-muted-foreground">
                  {job.progress}% complete
                </p>
              </div>
            )}

            {job.status === "error" && job.error && (
              <p className="text-sm text-destructive">{job.error}</p>
            )}
          </div>

          <div className="flex items-center gap-2">
            {job.status === "finished" && job.downloadUrl && (
              <Button size="sm" onClick={handleDownload}>
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            )}

            {job.status === "error" && (
              <Button size="sm" variant="outline">
                <RotateCw className="w-4 h-4 mr-2" />
                Retry
              </Button>
            )}

            <Button size="sm" variant="ghost" onClick={handleRemove}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
