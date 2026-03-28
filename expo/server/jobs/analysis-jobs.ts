import { db } from "../db";
import { analysisJobs, profiles } from "@shared/schema";
import { eq, asc } from "drizzle-orm";
import { runPhysiqueAnalysis } from "../services/physique-service";
import { decryptPayload } from "../utils/encryption";

let workerInterval: NodeJS.Timeout | null = null;
let isProcessing = false;

export function startAnalysisJobWorker() {
  if (workerInterval) return;

  workerInterval = setInterval(async () => {
    if (isProcessing) return;
    isProcessing = true;
    let currentJobId: string | null = null;

    try {
      const [job] = await db
        .select()
        .from(analysisJobs)
        .where(eq(analysisJobs.status, "queued"))
        .orderBy(asc(analysisJobs.createdAt))
        .limit(1);

      if (!job) {
        return;
      }
      currentJobId = job.id;

      await db
        .update(analysisJobs)
        .set({
          status: "running",
          startedAt: new Date(),
          updatedAt: new Date(),
          attempts: (job.attempts || 0) + 1,
        })
        .where(eq(analysisJobs.id, job.id));

      if (job.analysisType !== "physique") {
        throw new Error(`Unsupported analysis type: ${job.analysisType}`);
      }

      const payload = decryptPayload(job.requestPayload) || { photos: {} };
      const result = await runPhysiqueAnalysis(payload as any);

      await db
        .update(analysisJobs)
        .set({
          status: "completed",
          result,
          completedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(analysisJobs.id, job.id));

      if (job.profileId) {
        await db
          .update(profiles)
          .set({
            physiqueAnalysis: result,
            updatedAt: new Date(),
          })
          .where(eq(profiles.id, job.profileId));
      }
    } catch (error: any) {
      console.error("Analysis job error:", error);
      const message =
        typeof error?.message === "string"
          ? error.message
          : "Unknown analysis error";

      if (currentJobId) {
        await db
          .update(analysisJobs)
          .set({
            status: "failed",
            error: message,
            updatedAt: new Date(),
            completedAt: new Date(),
          })
          .where(eq(analysisJobs.id, currentJobId));
      }
    } finally {
      isProcessing = false;
    }
  }, 2000);
}
