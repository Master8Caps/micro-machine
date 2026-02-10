"use client";

import { useState, useEffect, useCallback } from "react";
import { ChannelPill, TypePill, StatusPill } from "@/components/pills";
import { CopyButton } from "@/components/copy-button";
import { useUser } from "@/components/user-context";
import {
  generateContentForCampaign,
  loadContentForCampaign,
  updateContentPieceStatus,
} from "@/server/actions/content";

interface ContentPiece {
  id: string;
  type: string;
  title: string;
  body: string;
  metadata: { cta_text?: string; notes?: string };
  status: string;
  created_at: string;
}

interface CampaignPanelProps {
  campaign: {
    id: string;
    product_id: string;
    angle: string;
    channel: string;
    hook: string;
    content_type: string;
    status: string;
    products: { name: string } | null;
    avatars: { name: string } | null;
  };
  onClose: () => void;
}

export function CampaignPanel({ campaign, onClose }: CampaignPanelProps) {
  const { role } = useUser();
  const [pieces, setPieces] = useState<ContentPiece[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    async function load() {
      const result = await loadContentForCampaign(campaign.id);
      if (result.pieces) setPieces(result.pieces as ContentPiece[]);
      setLoading(false);
    }
    load();
  }, [campaign.id]);

  // Close on Escape key
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const handleGenerate = useCallback(async () => {
    setGenerating(true);
    const result = await generateContentForCampaign({
      campaignId: campaign.id,
      productId: campaign.product_id,
    });
    if (result.pieces) {
      setPieces(result.pieces as ContentPiece[]);
    }
    setGenerating(false);
  }, [campaign.id, campaign.product_id]);

  async function handleStatusChange(pieceId: string, newStatus: string) {
    const result = await updateContentPieceStatus(
      pieceId,
      newStatus as "draft" | "ready" | "published" | "archived",
    );
    if (result.success) {
      setPieces((prev) =>
        prev.map((p) => (p.id === pieceId ? { ...p, status: newStatus } : p)),
      );
    }
  }

  const isAdmin = role === "admin";
  const hasContent = pieces.length > 0;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-2xl flex-col border-l border-zinc-800 bg-zinc-950 shadow-2xl">
        {/* Panel header */}
        <div className="flex items-start justify-between border-b border-zinc-800 p-6">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <ChannelPill channel={campaign.channel} />
              <TypePill type={campaign.content_type} />
              {campaign.avatars && (
                <span className="text-xs text-zinc-500">
                  for {campaign.avatars.name}
                </span>
              )}
            </div>
            {campaign.products && (
              <p className="mt-2 text-sm font-medium text-zinc-400">
                {campaign.products.name}
              </p>
            )}
            <h2 className="mt-2 text-lg font-semibold">{campaign.angle}</h2>
            <p className="mt-1 text-sm italic text-zinc-400">
              &ldquo;{campaign.hook}&rdquo;
            </p>
          </div>
          <button
            onClick={onClose}
            className="ml-4 rounded-lg p-2 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-200"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>

        {/* Panel body — scrollable */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Generate / status section */}
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-sm font-medium text-zinc-400">
              Content Pieces
            </h3>
            {isAdmin ? (
              <button
                onClick={handleGenerate}
                disabled={generating}
                className="rounded-lg border border-indigo-500/30 bg-indigo-500/10 px-4 py-2 text-sm font-medium text-indigo-300 transition-colors hover:bg-indigo-500/20 disabled:opacity-50"
              >
                {generating ? (
                  <span className="flex items-center gap-2">
                    <span className="h-3.5 w-3.5 animate-spin rounded-full border border-indigo-300/30 border-t-indigo-300" />
                    Generating...
                  </span>
                ) : hasContent ? (
                  "Regenerate Content"
                ) : (
                  "Generate Content"
                )}
              </button>
            ) : hasContent ? (
              <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400">
                Generated
              </span>
            ) : null}
          </div>

          {/* Loading state */}
          {loading && (
            <div className="flex justify-center py-12">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-700 border-t-white" />
            </div>
          )}

          {/* Empty state */}
          {!loading && !hasContent && (
            <div className="rounded-xl border border-dashed border-zinc-700 p-8 text-center">
              <p className="text-sm text-zinc-500">
                {isAdmin
                  ? "No content generated yet. Click the button above to generate."
                  : "No content generated for this campaign yet."}
              </p>
            </div>
          )}

          {/* Content pieces */}
          {!loading && hasContent && (
            <div className="space-y-4">
              {pieces.map((piece) => (
                <div
                  key={piece.id}
                  className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <TypePill type={piece.type} />
                        <StatusPill status={piece.status} />
                      </div>
                      {piece.title && (
                        <h4 className="mt-2 text-sm font-semibold">
                          {piece.title}
                        </h4>
                      )}
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <CopyButton text={piece.body} />
                      {isAdmin && (
                        <select
                          value={piece.status}
                          onChange={(e) =>
                            handleStatusChange(piece.id, e.target.value)
                          }
                          className="rounded border border-zinc-700 bg-zinc-800 px-2 py-1 text-xs text-zinc-400 focus:border-zinc-500 focus:outline-none"
                        >
                          <option value="draft">Draft</option>
                          <option value="ready">Ready</option>
                          <option value="published">Published</option>
                          <option value="archived">Archived</option>
                        </select>
                      )}
                    </div>
                  </div>
                  <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-zinc-300">
                    {piece.body}
                  </p>
                  {piece.metadata?.notes && (
                    <p className="mt-3 border-t border-zinc-800 pt-3 text-xs text-zinc-500">
                      <strong className="text-zinc-400">Notes:</strong>{" "}
                      {piece.metadata.notes}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
