"use client";

import { useState } from "react";
import { markContentPiecePosted } from "@/server/actions/content";

function formatPostedDate(date: string): string {
  const d = new Date(date);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function PostedToggle({
  pieceId,
  posted,
  postedAt,
}: {
  pieceId: string;
  posted: boolean;
  postedAt?: string | null;
}) {
  const [optimisticPosted, setOptimisticPosted] = useState(posted);
  const [saving, setSaving] = useState(false);

  async function handleToggle(e: React.MouseEvent) {
    e.stopPropagation();
    setSaving(true);
    const newPosted = !optimisticPosted;
    setOptimisticPosted(newPosted);
    const result = await markContentPiecePosted(pieceId, newPosted);
    if (!result.success) setOptimisticPosted(!newPosted);
    setSaving(false);
  }

  return (
    <button
      onClick={handleToggle}
      disabled={saving}
      title={optimisticPosted ? `Posted ${postedAt ? formatPostedDate(postedAt) : ""}` : "Mark as posted"}
      className={`rounded-md p-1.5 transition-colors disabled:opacity-50 ${
        optimisticPosted
          ? "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
          : "text-zinc-500 hover:bg-white/[0.05] hover:text-zinc-300"
      }`}
    >
      {optimisticPosted ? (
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      )}
    </button>
  );
}

export function PostedBadge({ postedAt }: { postedAt: string }) {
  return (
    <span className="flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-400">
      <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="currentColor" stroke="none">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
      </svg>
      Posted {formatPostedDate(postedAt)}
    </span>
  );
}
