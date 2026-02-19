"use server";

import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { sendActivationEmail } from "./email";
import { revalidatePath } from "next/cache";

// ── Activate a waitlisted user ───────────────────────
export async function activateUser(userId: string) {
  // Verify calling user is admin
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return { error: "Only admins can activate users" };
  }

  // Use service client to update the target user's profile
  const service = createServiceClient();

  const { error: updateError } = await service
    .from("profiles")
    .update({ status: "active" })
    .eq("id", userId);

  if (updateError) return { error: updateError.message };

  // Look up the user's email from auth
  const { data: authUser, error: authError } = await service.auth.admin.getUserById(userId);

  if (authError || !authUser?.user?.email) {
    // Profile updated but email failed — still a partial success
    return { success: true, emailSent: false };
  }

  // Send activation email
  await sendActivationEmail(authUser.user.email);

  revalidatePath("/");

  return { success: true, emailSent: true };
}
