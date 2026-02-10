"use server";

import { createClient } from "@/lib/supabase/server";

interface CreateProductInput {
  name: string;
  description: string;
  market: string;
  goals: string;
  channels: string[];
}

export async function createProduct(input: CreateProductInput) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const { data, error } = await supabase
    .from("products")
    .insert({
      user_id: user.id,
      name: input.name,
      description: input.description,
      market: input.market,
      goals: input.goals,
      channels: input.channels,
      status: "active",
    })
    .select("id")
    .single();

  if (error) {
    return { error: error.message };
  }

  return { id: data.id };
}
