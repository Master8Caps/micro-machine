"use server";

import { createClient } from "@/lib/supabase/server";
import { computeEngagementRaw } from "@/lib/score-utils";

export interface LearningInsight {
  topPerformers: {
    angle: string;
    hook: string;
    channel: string;
    contentType: string;
    avatarName: string;
    painPoints: string[];
    bodySnippet: string;
    compositeScore: number;
    clicks: number;
    engagementRaw: number;
  }[];
  patterns: {
    topPainPoints: string[];
    topChannels: string[];
    topContentTypes: string[];
    styleCues: string[];
  };
  underperformers: {
    angle: string;
    channel: string;
    compositeScore: number;
  }[];
  thumbsDownPieces: {
    angle: string;
    channel: string;
    contentType: string;
  }[];
  totalPiecesWithSignals: number;
}

export async function loadLearningInsights(
  productId: string,
): Promise<LearningInsight | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  // Fetch content pieces with campaigns and avatars joined
  const { data: pieces } = await supabase
    .from("content_pieces")
    .select(`
      id, type, body, rating,
      engagement_views, engagement_likes, engagement_comments, engagement_shares,
      campaigns!inner(angle, hook, channel, avatar_id),
      avatars(name, pain_points),
      links(click_count)
    `)
    .eq("product_id", productId)
    .eq("archived", false);

  if (!pieces || pieces.length === 0) return null;

  // First pass: compute raw values to find maxes
  const rawValues = pieces.map((p: Record<string, unknown>) => {
    const links = (p.links ?? []) as { click_count: number }[];
    const clicks = links.reduce(
      (sum: number, l: { click_count: number }) => sum + (l.click_count ?? 0),
      0,
    );
    const engRaw = computeEngagementRaw(
      p.engagement_views as number | null,
      p.engagement_likes as number | null,
      p.engagement_comments as number | null,
      p.engagement_shares as number | null,
    );
    return { piece: p, clicks, engRaw };
  });

  const maxClicks = Math.max(...rawValues.map((v) => v.clicks), 1);
  const maxEng = Math.max(...rawValues.map((v) => v.engRaw), 1);

  // Filter to pieces with any signal data and compute composite scores
  const scored: (typeof rawValues[number] & { compositeScore: number })[] = [];

  for (const item of rawValues) {
    const { piece, clicks, engRaw } = item;
    const rating = piece.rating as number | null;
    const hasSignal = clicks > 0 || engRaw > 0 || rating !== null;
    if (!hasSignal) continue;

    const clickSignal = (clicks / maxClicks) * 100;
    const engSignal = (engRaw / maxEng) * 100;
    const ratingSignal = rating === 1 ? 100 : rating === -1 ? 0 : 50;
    const compositeScore = Math.round(
      clickSignal * 0.4 + engSignal * 0.4 + ratingSignal * 0.2,
    );

    scored.push({ ...item, compositeScore });
  }

  if (scored.length === 0) return null;

  // Sort by composite score descending
  scored.sort((a, b) => b.compositeScore - a.compositeScore);

  // Top performers (score >= 70)
  const topPerformers = scored
    .filter((s) => s.compositeScore >= 70)
    .slice(0, 5)
    .map((s) => {
      const campaign = s.piece.campaigns as { angle: string; hook: string; channel: string } | null;
      const avatar = s.piece.avatars as { name: string; pain_points: string[] } | null;
      return {
        angle: campaign?.angle ?? "",
        hook: campaign?.hook ?? "",
        channel: campaign?.channel ?? "",
        contentType: s.piece.type as string,
        avatarName: avatar?.name ?? "",
        painPoints: avatar?.pain_points ?? [],
        bodySnippet: (s.piece.body as string).slice(0, 300),
        compositeScore: s.compositeScore,
        clicks: s.clicks,
        engagementRaw: s.engRaw,
      };
    });

  // Underperformers (score <= 30, excluding thumbs-down)
  const underperformers = scored
    .filter((s) => s.compositeScore <= 30 && (s.piece.rating as number | null) !== -1)
    .slice(-5)
    .map((s) => {
      const campaign = s.piece.campaigns as { angle: string; channel: string } | null;
      return {
        angle: campaign?.angle ?? "",
        channel: campaign?.channel ?? "",
        compositeScore: s.compositeScore,
      };
    });

  // Thumbs-down pieces
  const thumbsDownPieces = scored
    .filter((s) => (s.piece.rating as number | null) === -1)
    .map((s) => {
      const campaign = s.piece.campaigns as { angle: string; channel: string } | null;
      return {
        angle: campaign?.angle ?? "",
        channel: campaign?.channel ?? "",
        contentType: s.piece.type as string,
      };
    });

  // Pattern extraction from top half of scored pieces
  const topHalf = scored.slice(0, Math.ceil(scored.length / 2));

  // Top pain points
  const painPointCounts = new Map<string, number>();
  for (const s of topHalf) {
    const avatar = s.piece.avatars as { pain_points: string[] } | null;
    for (const pp of avatar?.pain_points ?? []) {
      painPointCounts.set(pp, (painPointCounts.get(pp) ?? 0) + 1);
    }
  }
  const topPainPoints = Array.from(painPointCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([pp]) => pp);

  // Top channels
  const channelCounts = new Map<string, number>();
  for (const s of topHalf) {
    const campaign = s.piece.campaigns as { channel: string } | null;
    const ch = campaign?.channel ?? "";
    if (ch) channelCounts.set(ch, (channelCounts.get(ch) ?? 0) + 1);
  }
  const topChannels = Array.from(channelCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([ch]) => ch);

  // Top content types
  const typeCounts = new Map<string, number>();
  for (const s of topHalf) {
    const t = s.piece.type as string;
    typeCounts.set(t, (typeCounts.get(t) ?? 0) + 1);
  }
  const topContentTypes = Array.from(typeCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([t]) => t);

  // Style cues from top performers
  const styleCues: string[] = [];
  const topBodies = topPerformers.map((p) => p.bodySnippet).join(" ");
  if (topBodies.includes("?")) styleCues.push("Question-led hooks");
  if (
    topBodies
      .split("\n")
      .some((l) => l.trim().startsWith("-") || l.trim().startsWith("•"))
  ) {
    styleCues.push("Bullet-point formatting");
  }
  const avgLength =
    topPerformers.length > 0
      ? topPerformers.reduce((sum, p) => sum + p.bodySnippet.length, 0) /
        topPerformers.length
      : 0;
  if (avgLength < 150) styleCues.push("Short, punchy format");
  else if (avgLength > 250) styleCues.push("Longer, detailed format");

  return {
    topPerformers,
    patterns: {
      topPainPoints,
      topChannels,
      topContentTypes,
      styleCues,
    },
    underperformers,
    thumbsDownPieces,
    totalPiecesWithSignals: scored.length,
  };
}
