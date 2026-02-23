export function getScoreTier(score: number): { label: string; color: string } {
  if (score === 0) return { label: "No data", color: "zinc" };
  if (score >= 80) return { label: "Top performer", color: "emerald" };
  if (score >= 50) return { label: "Moderate", color: "amber" };
  if (score >= 20) return { label: "Low", color: "orange" };
  return { label: "Underperforming", color: "red" };
}

export function scoreBarColor(color: string): string {
  const map: Record<string, string> = {
    emerald: "bg-emerald-500/60",
    amber: "bg-amber-500/60",
    orange: "bg-orange-500/60",
    red: "bg-red-500/60",
    zinc: "bg-zinc-600/40",
  };
  return map[color] ?? "bg-zinc-600/40";
}

export function scoreTextColor(color: string): string {
  const map: Record<string, string> = {
    emerald: "text-emerald-400",
    amber: "text-amber-400",
    orange: "text-orange-400",
    red: "text-red-400",
    zinc: "text-zinc-500",
  };
  return map[color] ?? "text-zinc-500";
}
