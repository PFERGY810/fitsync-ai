import type { DailyCheckIn } from "@/types";

function average(values: number[]) {
  if (!values.length) return 0;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

export function calculateRecoverySummary(checkIns: DailyCheckIn[]) {
  if (!checkIns.length) return null;
  const sorted = [...checkIns].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );
  const window = sorted.slice(-7);
  if (!window.length) return null;

  const avgSleep = average(window.map((c) => c.sleepHours || 0));
  const avgStress = average(window.map((c) => c.stressLevel || 0));
  const avgSoreness = average(window.map((c) => c.sorenessLevel || 0));

  const sleepScore = Math.min(avgSleep / 8, 1) * 50;
  const stressScore = (1 - (avgStress - 1) / 6) * 25;
  const sorenessScore = (1 - (avgSoreness - 1) / 6) * 25;
  const score = Math.round(sleepScore + stressScore + sorenessScore);

  const deloadSignal = score < 55 || avgSoreness >= 5 || avgSleep < 6;

  return {
    score,
    avgSleep,
    avgStress,
    avgSoreness,
    deloadSignal,
  };
}
