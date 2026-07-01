export function getUsageColor(ratio: number): string {
  if (ratio > 0.9) return "bg-destructive";
  if (ratio > 0.7) return "bg-chart-3";
  return "bg-chart-2";
}
