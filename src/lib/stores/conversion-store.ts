import { uuidv7 } from "uuidv7";
import { create } from "zustand";
import type { ConversionJob, ImageFormat } from "@/types/conversion";

interface ConversionStore {
  jobs: ConversionJob[];
  activeJobs: number;

  // Actions
  addJob: (file: File, format: ImageFormat, quality: number) => string;
  updateJob: (jobId: string, updates: Partial<ConversionJob>) => void;
  removeJob: (jobId: string) => void;
  clearCompleted: () => void;

  // Derived state
  getJob: (jobId: string) => ConversionJob | undefined;
  getPendingJobs: () => ConversionJob[];
  getActiveJobs: () => ConversionJob[];
  getCompletedJobs: () => ConversionJob[];
}

export const useConversionStore = create<ConversionStore>((set, get) => ({
  jobs: [],
  activeJobs: 0,

  addJob: (file: File, outputFormat: ImageFormat, quality: number) => {
    const jobId = uuidv7();
    const fileName = file.name;
    const fileSize = file.size;
    const inputFormat = file.type.split("/")[1] as ImageFormat;

    const newJob: ConversionJob = {
      id: jobId,
      fileName,
      fileSize,
      inputFormat,
      outputFormat,
      quality,
      status: "queued",
      progress: 0,
      createdAt: new Date(),
    };

    set((state) => ({
      jobs: [...state.jobs, newJob],
    }));

    return jobId;
  },

  updateJob: (jobId: string, updates: Partial<ConversionJob>) => {
    set((state) => ({
      jobs: state.jobs.map((job) =>
        job.id === jobId ? { ...job, ...updates } : job,
      ),
    }));
  },

  removeJob: (jobId: string) => {
    set((state) => ({
      jobs: state.jobs.filter((job) => job.id !== jobId),
    }));
  },

  clearCompleted: () => {
    set((state) => ({
      jobs: state.jobs.filter(
        (job) => job.status !== "finished" && job.status !== "error",
      ),
    }));
  },

  getJob: (jobId: string) => {
    return get().jobs.find((job) => job.id === jobId);
  },

  getPendingJobs: () => {
    return get().jobs.filter((job) => job.status === "queued");
  },

  getActiveJobs: () => {
    return get().jobs.filter(
      (job) => job.status === "uploading" || job.status === "processing",
    );
  },

  getCompletedJobs: () => {
    return get().jobs.filter(
      (job) => job.status === "finished" || job.status === "error",
    );
  },
}));
