import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const phoneSchema = z
  .string()
  .trim()
  .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number");

const requestSchema = z.object({
  phone: phoneSchema,
  fullName: z.string().trim().min(2).max(80).optional(),
  mode: z.enum(["login", "signup"]),
});

const verifySchema = z.object({
  phone: phoneSchema,
  code: z.string().trim().regex(/^\d{6}$/, "Enter the 6-digit code"),
  fullName: z.string().trim().min(2).max(80).optional(),
  village: z.string().trim().max(80).optional(),
  language: z.enum(["en", "mr", "hi"]).default("en"),
});

const OTP_TTL_MINUTES = 5;
const MAX_ATTEMPTS = 5;
const MAX_SENDS_PER_WINDOW = 3;
const SEND_WINDOW_MINUTES = 15;

function accountEmail(phone: string) {
  return `farmer.${phone}@marketmitra.app`;
}

async function hashCode(phone: string, code: string) {
  const pepper = process.env["OTP_PEPPER"] ?? "";
  const bytes = new TextEncoder().encode(`${phone}:${code}:${pepper}`);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function randomCode() {
  const n = crypto.getRandomValues(new Uint32Array(1))[0]!;
  return String(n % 1000000).padStart(6, "0");
}

function randomPassword() {
  return Array.from(crypto.getRandomValues(new Uint8Array(24)))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export const requestPhoneOtp = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => requestSchema.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { phone, mode } = data;

    const { data: existing } = await supabaseAdmin
      .from("profiles")
      .select("id, full_name")
      .eq("phone", phone)
      .maybeSingle();

    if (mode === "login" && !existing) {
      return { ok: false as const, error: "No account found for this number. Please sign up first." };
    }
    if (mode === "signup" && existing) {
      return { ok: false as const, error: "This number is already registered. Please log in." };
    }
    if (mode === "signup" && !data.fullName) {
      return { ok: false as const, error: "Please enter your full name." };
    }

    const windowStart = new Date(Date.now() - SEND_WINDOW_MINUTES * 60_000).toISOString();
    const { count } = await supabaseAdmin
      .from("phone_verification_codes")
      .select("id", { count: "exact", head: true })
      .eq("phone", phone)
      .gte("created_at", windowStart);

    if ((count ?? 0) >= MAX_SENDS_PER_WINDOW) {
      return {
        ok: false as const,
        error: `Too many code requests. Try again after ${SEND_WINDOW_MINUTES} minutes.`,
      };
    }

    const code = randomCode();
    const { error } = await supabaseAdmin.from("phone_verification_codes").insert({
      phone,
      code_hash: await hashCode(phone, code),
      expires_at: new Date(Date.now() + OTP_TTL_MINUTES * 60_000).toISOString(),
    });
    if (error) throw new Error(error.message);

    const delivery = await sendOtpSms(phone, code);
    if (delivery.status === "failed") {
      return { ok: false as const, error: delivery.error };
    }

    return {
      ok: true as const,
      expiresInSeconds: OTP_TTL_MINUTES * 60,
      delivered: delivery.status === "sent",
      // Only present until an SMS sender is connected, so sign-in is never blocked.
      ...(delivery.status === "not_configured" ? { code } : {}),
    };
  });

type SmsResult =
  | { status: "sent" }
  | { status: "not_configured" }
  | { status: "failed"; error: string };

async function sendOtpSms(phone: string, code: string): Promise<SmsResult> {
  const lovableKey = process.env["LOVABLE_API_KEY"];
  const twilioKey = process.env["TWILIO_API_KEY"];
  const from = process.env["TWILIO_FROM_NUMBER"];
  if (!lovableKey || !twilioKey || !from) return { status: "not_configured" };

  try {
    const response = await fetch("https://connector-gateway.lovable.dev/twilio/Messages.json", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableKey}`,
        "X-Connection-Api-Key": twilioKey,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        To: `+91${phone}`,
        From: from,
        Body: `${code} is your MarketMitra verification code. It expires in ${OTP_TTL_MINUTES} minutes. Do not share it with anyone.`,
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      console.error(`Twilio send failed [${response.status}]: ${body.slice(0, 400)}`);
      return {
        status: "failed",
        error:
          response.status === 429
            ? "Too many messages right now. Please try again in a minute."
            : "We could not send the SMS. Please check the number and try again.",
      };
    }

    return { status: "sent" };
  } catch (err) {
    console.error("Twilio network error", err);
    return { status: "failed", error: "Network problem while sending the SMS. Please try again." };
  }
}

export const verifyPhoneOtp = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => verifySchema.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { phone, code } = data;

    const { data: row } = await supabaseAdmin
      .from("phone_verification_codes")
      .select("id, code_hash, expires_at, attempts, consumed_at")
      .eq("phone", phone)
      .is("consumed_at", null)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!row) return { ok: false as const, error: "No active code. Please request a new one." };
    if (new Date(row.expires_at).getTime() < Date.now()) {
      return { ok: false as const, error: "This code has expired. Please request a new one." };
    }
    if (row.attempts >= MAX_ATTEMPTS) {
      return { ok: false as const, error: "Too many wrong attempts. Please request a new code." };
    }

    const expected = await hashCode(phone, code);
    if (expected !== row.code_hash) {
      await supabaseAdmin
        .from("phone_verification_codes")
        .update({ attempts: row.attempts + 1 })
        .eq("id", row.id);
      return {
        ok: false as const,
        error: `Incorrect code. ${MAX_ATTEMPTS - row.attempts - 1} attempts left.`,
      };
    }

    await supabaseAdmin
      .from("phone_verification_codes")
      .update({ consumed_at: new Date().toISOString() })
      .eq("id", row.id);

    const email = accountEmail(phone);
    const password = randomPassword();

    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("id, full_name")
      .eq("phone", phone)
      .maybeSingle();

    let userId = profile?.id;

    if (!userId) {
      if (!data.fullName) return { ok: false as const, error: "Please enter your full name." };
      const { data: created, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        phone_confirm: false,
        user_metadata: { phone, full_name: data.fullName },
      });
      if (createError || !created.user) {
        return { ok: false as const, error: createError?.message ?? "Could not create your account." };
      }
      userId = created.user.id;

      const { error: profileError } = await supabaseAdmin.from("profiles").insert({
        id: userId,
        phone,
        full_name: data.fullName,
        village: data.village ?? null,
        language: data.language,
      });
      if (profileError) return { ok: false as const, error: profileError.message };
    } else {
      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
        password,
      });
      if (updateError) return { ok: false as const, error: updateError.message };
      await supabaseAdmin.from("profiles").update({ language: data.language }).eq("id", userId);
    }

    // One-time credential: the password is rotated on every verified sign-in and
    // is only used by the client to establish the session immediately.
    return { ok: true as const, email, password, fullName: profile?.full_name ?? data.fullName! };
  });
