"use server";

import { createServiceClient } from "@/lib/supabase/service";
import { sendWaitlistConfirmation } from "./email";

export async function addToWaitlist(email: string) {
  try {
    const normalised = email.toLowerCase().trim();
    const supabase = createServiceClient();

    // Check if already on the waitlist (avoid re-sending email on duplicate signup)
    const { data: existing } = await supabase
      .from("waitlist")
      .select("email")
      .eq("email", normalised)
      .maybeSingle();

    const { error } = await supabase
      .from("waitlist")
      .upsert(
        { email: normalised, source: "app-signup" },
        { onConflict: "email" },
      );

    if (error) {
      console.error("Failed to add to waitlist:", error.message);
      return;
    }

    // Only send confirmation email for new signups
    if (!existing) {
      sendWaitlistConfirmation(normalised);
    }
  } catch (err) {
    console.error("Waitlist action error:", err);
  }
}
