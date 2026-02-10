"use client";

import { useState } from "react";
import { ChannelPill, TypePill, StatusPill } from "@/components/pills";
import { CopyButton } from "@/components/copy-button";
import { useUser } from "@/components/user-context";
import { updateContentPieceStatus } from "@/server/actions/content";

interface ContentPieceRow {
  id: string;
  product_id: string;
  campaign_id: string | null;
  type: string;
  title: string | null;
  body: string;
  metadata: { channel?: string; angle?: string; cta_text?: string; notes?: string };
  status: string;
  created_at: string;
  products: { name: string } | null;
  campaigns: { angle: string; channel: string } | null;
}

const typeOptions = [
  { value: "", label: "All types" },
  { value: "linkedin-post", label: "LinkedIn Post" },
  { value: "twitter-post", label: "Tweet" },
  { value: "twitter-thread", label: "Thread" },
  { value: "video-hook", label: "Video Hook" },
  { value: "video-script", label: "Video Script" },
  { value: "image-prompt", label: "Image Prompt" },
  { value: "landing-page-copy", label: "Landing Page" },
  { value: "email", label: "Email" },
  { value: "ad-copy", label: "Ad Copy" },
];

const statusOptions = [
  { value: "", label: "All statuses" },
  { value: "draft", label: "Draft" },
  { value: "ready", label: "Ready" },
  { value: "published", label: "Published" },
  { value: "archived", label: "Archived" },
];

export function ContentList({
  pieces: initialPieces,
  products,
}: {
  pieces: ContentPieceRow[];
  products: { id: string; name: string }[];
}) {
  const { role } = useUser();
  const [pieces, setPieces] = useState(initialPieces);
  const [productFilter, setProductFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const isAdmin = role === "admin";

  const filtered = pieces.filter((p) => {
    if (productFilter && p.product_id !== productFilter) return false;
    if (typeFilter && p.type !== typeFilter) return false;
    if (statusFilter && p.status !== statusFilter) return false;
    return true;
  });

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

  return (
    <>
      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-3">
        <select
          value={productFilter}
          onChange={(e) => setProductFilter(e.target.value)}
          className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-300 focus:border-zinc-500 focus:outline-none"
        >
          <option value="">All products</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-300 focus:border-zinc-500 focus:outline-none"
        >
          {typeOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-300 focus:border-zinc-500 focus:outline-none"
        >
          {statusOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <span className="flex items-center text-sm text-zinc-500">
          {filtered.length} piece{filtered.length === 1 ? "" : "s"}
        </span>
      </div>

      {/* Content list */}
      <div className="space-y-4">
        {filtered.map((piece) => {
          const isExpanded = expandedId === piece.id;

          return (
            <div
              key={piece.id}
              className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6"
            >
              {/* Product name at top */}
              {piece.products && (
                <p className="mb-2 text-sm font-medium text-zinc-400">
                  {piece.products.name}
                </p>
              )}

              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {piece.campaigns && (
                      <ChannelPill channel={piece.campaigns.channel} />
                    )}
                    <TypePill type={piece.type} />
                    <StatusPill status={piece.status} />
                  </div>
                  {piece.title && (
                    <h3 className="mt-2 font-semibold">{piece.title}</h3>
                  )}
                  {piece.campaigns?.angle && (
                    <p className="mt-1 text-xs text-zinc-500">
                      {piece.campaigns.angle}
                    </p>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <CopyButton text={piece.body} />
                  {isAdmin && (
                    <select
                      value={piece.status}
                      onChange={(e) => handleStatusChange(piece.id, e.target.value)}
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

              {/* Body preview / expand */}
              <button
                onClick={() => setExpandedId(isExpanded ? null : piece.id)}
                className="mt-3 w-full text-left"
              >
                <p
                  className={`whitespace-pre-wrap text-sm leading-relaxed text-zinc-300 ${
                    isExpanded ? "" : "line-clamp-3"
                  }`}
                >
                  {piece.body}
                </p>
                {!isExpanded && piece.body.length > 200 && (
                  <span className="mt-1 inline-block text-xs text-zinc-500">
                    Click to expand...
                  </span>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </>
  );
}
