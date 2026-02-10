"use server";

import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";

const anthropic = new Anthropic();

interface GenerateBrainInput {
  productId: string;
}

interface BrainAvatar {
  name: string;
  description: string;
  pain_points: string[];
  channels: string[];
  icp_details: {
    role: string;
    context: string;
    motivation: string;
  };
}

interface BrainCampaign {
  avatar_name: string;
  angle: string;
  channel: string;
  hook: string;
  content_type: string;
  why_it_works: string;
}

interface BrainOutput {
  avatars: BrainAvatar[];
  campaigns: BrainCampaign[];
  positioning_summary: string;
}

export async function generateBrain(input: GenerateBrainInput) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  // Fetch the product
  const { data: product, error: productError } = await supabase
    .from("products")
    .select("*")
    .eq("id", input.productId)
    .single();

  if (productError || !product) {
    return { error: "Product not found" };
  }

  // Create a generation record
  const { data: generation, error: genError } = await supabase
    .from("generations")
    .insert({
      product_id: product.id,
      model: "claude-sonnet-4-20250514",
      prompt_version: "1.0",
      status: "processing",
    })
    .select("id")
    .single();

  if (genError || !generation) {
    return { error: "Failed to create generation record" };
  }

  try {
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      messages: [
        {
          role: "user",
          content: buildPrompt(product),
        },
      ],
    });

    const textBlock = message.content.find((block) => block.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      throw new Error("No text response from Claude");
    }

    // Extract JSON from the response
    const jsonMatch = textBlock.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON found in response");
    }

    const brainOutput: BrainOutput = JSON.parse(jsonMatch[0]);

    // Save raw output to generation
    await supabase
      .from("generations")
      .update({
        raw_output: brainOutput,
        status: "completed",
      })
      .eq("id", generation.id);

    // Save avatars
    const avatarInserts = brainOutput.avatars.map((avatar) => ({
      product_id: product.id,
      generation_id: generation.id,
      name: avatar.name,
      description: avatar.description,
      pain_points: avatar.pain_points,
      channels: avatar.channels,
      icp_details: avatar.icp_details,
    }));

    const { data: savedAvatars } = await supabase
      .from("avatars")
      .insert(avatarInserts)
      .select("id, name");

    // Save campaigns (link to avatars by name)
    if (savedAvatars) {
      const avatarMap = new Map(
        savedAvatars.map((a) => [a.name, a.id]),
      );

      const campaignInserts = brainOutput.campaigns.map((campaign) => ({
        product_id: product.id,
        avatar_id: avatarMap.get(campaign.avatar_name) || savedAvatars[0].id,
        generation_id: generation.id,
        angle: campaign.angle,
        channel: campaign.channel,
        hook: campaign.hook,
        content_type: campaign.content_type,
        status: "draft" as const,
      }));

      await supabase.from("campaigns").insert(campaignInserts);
    }

    return { generationId: generation.id, output: brainOutput };
  } catch (err) {
    // Mark generation as failed
    await supabase
      .from("generations")
      .update({
        status: "failed",
        error_message: err instanceof Error ? err.message : "Unknown error",
      })
      .eq("id", generation.id);

    return {
      error: err instanceof Error ? err.message : "Generation failed",
    };
  }
}

function buildPrompt(product: {
  name: string;
  description: string;
  market: string;
  goals: string;
  channels: string[];
}): string {
  return `You are a marketing strategist specializing in early-stage SaaS growth. Your job is to analyze a product brief and generate a structured marketing brain — target avatars, campaign angles, and hooks.

PRODUCT BRIEF:
- Name: ${product.name}
- Description: ${product.description}
- Target market: ${product.market}
- Goals: ${product.goals}
- Channels: ${product.channels.join(", ")}

INSTRUCTIONS:
1. Identify 2-3 distinct target avatars (ideal customer profiles). Each should be specific and actionable, not generic.
2. For each avatar, generate 2-3 campaign angles with specific hooks. Each campaign should target one channel and one avatar.
3. Hooks should be ready to use as the opening line of a social post — specific, provocative, and curiosity-driven.
4. Content types must be one of: text-post, thread, video-hook, video-script, image-prompt, landing-page, email, ad-copy

Respond with ONLY valid JSON in this exact structure:
{
  "avatars": [
    {
      "name": "Avatar Name",
      "description": "Who they are and their context",
      "pain_points": ["Pain point 1", "Pain point 2", "Pain point 3"],
      "channels": ["Channel 1", "Channel 2"],
      "icp_details": {
        "role": "Their role or identity",
        "context": "Their current situation",
        "motivation": "What drives them to look for a solution"
      }
    }
  ],
  "campaigns": [
    {
      "avatar_name": "Must match an avatar name above",
      "angle": "The strategic angle for this campaign",
      "channel": "One specific channel",
      "hook": "The opening line or hook — specific and ready to post",
      "content_type": "text-post",
      "why_it_works": "One sentence on why this angle resonates with this avatar"
    }
  ],
  "positioning_summary": "A 2-3 sentence summary of the recommended positioning for this product"
}`;
}
