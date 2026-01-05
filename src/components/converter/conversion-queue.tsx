"use client";

import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useConversionStore } from "@/lib/stores/conversion-store";
import { JobCard } from "./job-card";

export function ConversionQueue() {
  const { jobs, clearCompleted } = useConversionStore();

  const activeJobs = jobs.filter(
    (j) => j.status === "processing" || j.status === "uploading",
  );
  const queuedJobs = jobs.filter((j) => j.status === "queued");
  const completedJobs = jobs.filter(
    (j) => j.status === "finished" || j.status === "error",
  );

  if (jobs.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Conversions</h2>
          <p className="text-sm text-muted-foreground">
            {activeJobs.length} converting • {queuedJobs.length} queued •{" "}
            {completedJobs.length} completed
          </p>
        </div>

        {completedJobs.length > 0 && (
          <Button variant="outline" size="sm" onClick={clearCompleted}>
            <Trash2 className="w-4 h-4 mr-2" />
            Clear Completed
          </Button>
        )}
      </div>

      <div className="space-y-3">
        {jobs.map((job) => (
          <JobCard key={job.id} job={job} />
        ))}
      </div>
    </div>
  );
}
