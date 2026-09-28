import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const phoneSchema = z
  .string()
  .trim()
  .regex(/^(\+91)?[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number");

async function hashCode(code: string) {
  const pepper = process.env["OTP_PEPPER"] ?? "";
  const bytes = new TextEncoder().encode(`${code}:${pepper}`);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function normalise(phone: string) {
  const digits = phone.replace(/\D/g, "");
  return `+91${digits.slice(-10)}`;
}

/** Emails a 6-digit code to the signed-in account so the owner proves the number is theirs. */
export const sendPhoneVerificationCode = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ phone: phoneSchema }).parse(data))
  .handler(async ({ data, context }) => {
    const { supabase, userId, claims } = context;
    const email = (claims as { email?: string }).email;
    if (!email) throw new Error("Your account has no email address to send the code to.");

    const phone = normalise(data.phone);
    const code = String(Math.floor(100000 + Math.random() * 900000));

    const { error: profileError } = await supabase
      .from("profiles")
      .update({ phone } as never)
      .eq("id", userId);
    if (profileError) throw new Error(profileError.message);

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const codeHash = await hashCode(code);
    const { error: invalidateError } = await supabaseAdmin
      .from("phone_verification_codes")
      .update({ consumed_at: new Date().toISOString() } as never)
      .eq("user_id", userId)
      .is("consumed_at", null);
    if (invalidateError) throw new Error(invalidateError.message);

    const { data: otpRow, error } = await supabaseAdmin
      .from("phone_verification_codes")
      .insert({
        user_id: userId,
        phone,
        code_hash: codeHash,
        expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
      } as never)
      .select("id, created_at")
      .single();
    if (error) throw new Error(error.message);

    console.info("[Phone verification] OTP issued", {
      otpRowId: otpRow.id,
      createdAt: otpRow.created_at,
      phone,
      otpPepperConfigured: Boolean(process.env["OTP_PEPPER"]),
      codeLength: code.length,
    });

    const { sendTemplateEmail } = await import("./email-templates/send-email");
    const result = await sendTemplateEmail("phone-code", email, {
      templateData: { code, phone },
    });

    return { sent: result.sent, maskedEmail: email.replace(/^(.).*(@.*)$/, "$1***$2"), phone };
  });

export const confirmPhoneVerificationCode = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z.object({ code: z.string().trim().regex(/^\d{6}$/) }).parse(data),
  )
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: rows } = await supabaseAdmin
      .from("phone_verification_codes")
      .select("id, code_hash, attempts, expires_at, consumed_at, created_at, phone")
      .eq("user_id", userId)
      .is("consumed_at", null)
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(1);

    const row = (rows ?? [])[0];
    if (!row) throw new Error("Request a new code first.");
    if (row.attempts >= 5) throw new Error("Too many attempts. Request a new code.");

    const enteredCodeHash = await hashCode(data.code);
    if (enteredCodeHash !== row.code_hash) {
      console.warn("[Phone verification] OTP mismatch", {
        userId,
        otpRowId: row.id,
        createdAt: row.created_at,
        expiresAt: row.expires_at,
        phone: row.phone,
        otpPepperConfigured: Boolean(process.env["OTP_PEPPER"]),
        enteredCodeLength: data.code.length,
        generatedHashLength: enteredCodeHash.length,
      });

      await supabaseAdmin
        .from("phone_verification_codes")
        .update({ attempts: row.attempts + 1 } as never)
        .eq("id", row.id);
      throw new Error("That code is incorrect.");
    }

    await supabaseAdmin
      .from("phone_verification_codes")
      .update({ consumed_at: new Date().toISOString() } as never)
      .eq("id", row.id);

    const { data: updatedProfiles, error } = await supabaseAdmin
      .from("profiles")
      .update({
        phone: row.phone,
        phone_verified: true,
        phone_verified_at: new Date().toISOString(),
      } as never)
      .eq("id", userId)
      .select("id, phone, phone_verified, phone_verified_at");

    const updatedProfile = updatedProfiles?.[0];
    console.info("[Phone verification] Profile update result", {
      updateError: error?.message ?? null,
      returnedRows: updatedProfiles?.length ?? 0,
      zeroRows: updatedProfiles?.length === 0,
      phoneVerified: updatedProfile?.phone_verified ?? null,
      phone: updatedProfile?.phone ?? null,
    });

    if (error) throw new Error(error.message);

    return { verified: true, phone: row.phone as string };
  });
