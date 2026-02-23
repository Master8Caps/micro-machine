"use server";

import { createClient } from "@/lib/supabase/server";

interface PerformanceInput {
  productId: string;
  period?: "all" | "30d" | "7d";
}

export interface CampaignScore {
  campaignId: string;
  avatarId: string;
  channel: string;
  angle: string;
  category: string;
  totalClicks: number;
  linkCount: number;
  normalizedScore: number;
}

export interface AvatarScore {
  avatarId: string;
  name: string;
  totalClicks: number;
  campaignCount: number;
  normalizedScore: number;
  topChannel: string | null;
}

export interface ChannelScore {
  channel: string;
  totalClicks: number;
  campaignCount: number;
  normalizedScore: number;
}

export interface PerformanceData {
  campaigns: CampaignScore[];
  avatars: AvatarScore[];
  channels: ChannelScore[];
  totalClicks: number;
  hasData: boolean;
}

export async function loadPerformanceScores(
  input: PerformanceInput,
): Promise<PerformanceData | { error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const period = input.period ?? "all";

  // 1. Fetch all campaigns for this product
  const { data: campaigns } = await supabase
    .from("campaigns")
    .select("id, avatar_id, channel, angle, category")
    .eq("product_id", input.productId);

  if (!campaigns || campaigns.length === 0) {
    return { campaigns: [], avatars: [], channels: [], totalClicks: 0, hasData: false };
  }

  // 2. Fetch all links for this product with click counts
  const { data: links } = await supabase
    .from("links")
    .select("id, campaign_id, click_count")
    .eq("product_id", input.productId);

  // 3. If period filter, count clicks from the clicks table instead of using denormalized click_count
  let clicksByLink: Map<string, number> | null = null;
  if (period !== "all" && links && links.length > 0) {
    const daysAgo = period === "7d" ? 7 : 30;
    const since = new Date();
    since.setDate(since.getDate() - daysAgo);

    const linkIds = links.map((l) => l.id);
    const { data: clicks } = await supabase
      .from("clicks")
      .select("link_id")
      .in("link_id", linkIds)
      .gte("clicked_at", since.toISOString());

    clicksByLink = new Map();
    for (const click of clicks ?? []) {
      clicksByLink.set(click.link_id, (clicksByLink.get(click.link_id) ?? 0) + 1);
    }
  }

  // 4. Aggregate clicks per campaign
  const campaignClicks = new Map<string, { clicks: number; linkCount: number }>();
  for (const link of links ?? []) {
    if (!link.campaign_id) continue;
    const clicks = clicksByLink
      ? (clicksByLink.get(link.id) ?? 0)
      : (link.click_count ?? 0);
    const current = campaignClicks.get(link.campaign_id) ?? { clicks: 0, linkCount: 0 };
    campaignClicks.set(link.campaign_id, {
      clicks: current.clicks + clicks,
      linkCount: current.linkCount + 1,
    });
  }

  // 5. Build campaign scores with normalization
  const maxCampaignClicks = Math.max(
    ...Array.from(campaignClicks.values()).map((v) => v.clicks),
    1,
  );

  const campaignScores: CampaignScore[] = campaigns.map((c) => {
    const data = campaignClicks.get(c.id) ?? { clicks: 0, linkCount: 0 };
    return {
      campaignId: c.id,
      avatarId: c.avatar_id,
      channel: c.channel,
      angle: c.angle,
      category: c.category,
      totalClicks: data.clicks,
      linkCount: data.linkCount,
      normalizedScore: Math.round((data.clicks / maxCampaignClicks) * 100),
    };
  });

  // 6. Aggregate avatar scores
  const { data: avatars } = await supabase
    .from("avatars")
    .select("id, name")
    .eq("product_id", input.productId)
    .eq("is_active", true);

  const avatarClickMap = new Map<
    string,
    { clicks: number; count: number; channels: Map<string, number> }
  >();
  for (const cs of campaignScores) {
    const current = avatarClickMap.get(cs.avatarId) ?? {
      clicks: 0,
      count: 0,
      channels: new Map(),
    };
    current.clicks += cs.totalClicks;
    current.count += 1;
    current.channels.set(
      cs.channel,
      (current.channels.get(cs.channel) ?? 0) + cs.totalClicks,
    );
    avatarClickMap.set(cs.avatarId, current);
  }

  const maxAvatarClicks = Math.max(
    ...Array.from(avatarClickMap.values()).map((v) => v.clicks),
    1,
  );

  const avatarScores: AvatarScore[] = (avatars ?? []).map((a) => {
    const data = avatarClickMap.get(a.id) ?? {
      clicks: 0,
      count: 0,
      channels: new Map(),
    };
    let topChannel: string | null = null;
    let topChannelClicks = 0;
    for (const [ch, clicks] of data.channels) {
      if (clicks > topChannelClicks) {
        topChannel = ch;
        topChannelClicks = clicks;
      }
    }
    return {
      avatarId: a.id,
      name: a.name,
      totalClicks: data.clicks,
      campaignCount: data.count,
      normalizedScore: Math.round((data.clicks / maxAvatarClicks) * 100),
      topChannel,
    };
  });

  // 7. Aggregate channel scores
  const channelClickMap = new Map<string, { clicks: number; count: number }>();
  for (const cs of campaignScores) {
    const current = channelClickMap.get(cs.channel) ?? { clicks: 0, count: 0 };
    current.clicks += cs.totalClicks;
    current.count += 1;
    channelClickMap.set(cs.channel, current);
  }

  const maxChannelClicks = Math.max(
    ...Array.from(channelClickMap.values()).map((v) => v.clicks),
    1,
  );

  const channelScores: ChannelScore[] = Array.from(channelClickMap.entries())
    .map(([channel, data]) => ({
      channel,
      totalClicks: data.clicks,
      campaignCount: data.count,
      normalizedScore: Math.round((data.clicks / maxChannelClicks) * 100),
    }))
    .sort((a, b) => b.totalClicks - a.totalClicks);

  const totalClicks = campaignScores.reduce((sum, c) => sum + c.totalClicks, 0);

  return {
    campaigns: campaignScores,
    avatars: avatarScores,
    channels: channelScores,
    totalClicks,
    hasData: totalClicks > 0,
  };
}
