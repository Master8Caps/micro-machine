"use server";

import { createServiceClient } from "@/lib/supabase/service";

export async function addToWaitlist(email: string) {
  try {
    const supabase = createServiceClient();
    const { error } = await supabase
      .from("waitlist")
      .upsert(
        { email: email.toLowerCase().trim(), source: "app-signup" },
        { onConflict: "email" },
      );
    if (error) {
      console.error("Failed to add to waitlist:", error.message);
    }
  } catch (err) {
    console.error("Waitlist action error:", err);
  }
}
