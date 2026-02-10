"use server";

import { createClient } from "@/lib/supabase/server";

interface LoadBrainInput {
  productId: string;
}

export async function loadBrain(input: LoadBrainInput) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  // Fetch product status
  const { data: product } = await supabase
    .from("products")
    .select("status")
    .eq("id", input.productId)
    .single();

  // Find the most recent completed generation for this product
  const { data: generation } = await supabase
    .from("generations")
    .select("id, raw_output")
    .eq("product_id", input.productId)
    .eq("status", "completed")
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  // Fetch campaigns with database IDs
  const { data: campaigns } = await supabase
    .from("campaigns")
    .select("id, avatar_id, angle, channel, hook, content_type, status")
    .eq("product_id", input.productId)
    .order("created_at", { ascending: false });

  // Fetch existing content pieces grouped by campaign
  const { data: contentPieces } = await supabase
    .from("content_pieces")
    .select("id, campaign_id")
    .eq("product_id", input.productId);

  const contentCountMap: Record<string, number> = {};
  contentPieces?.forEach((piece) => {
    if (piece.campaign_id) {
      contentCountMap[piece.campaign_id] = (contentCountMap[piece.campaign_id] ?? 0) + 1;
    }
  });

  if (!generation || !generation.raw_output) {
    return {
      output: null,
      campaigns: campaigns ?? [],
      contentCounts: contentCountMap,
      productStatus: product?.status ?? "active",
    };
  }

  return {
    output: generation.raw_output,
    campaigns: campaigns ?? [],
    contentCounts: contentCountMap,
    productStatus: product?.status ?? "active",
  };
}
