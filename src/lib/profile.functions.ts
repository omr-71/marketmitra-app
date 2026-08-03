import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const schema = z.object({
  full_name: z.string().trim().min(2).max(80).optional(),
  village: z.string().trim().max(80).optional(),
  state: z.string().trim().max(60).optional(),
  district: z.string().trim().max(60).optional(),
  latitude: z.number().min(-90).max(90).nullable().optional(),
  longitude: z.number().min(-180).max(180).nullable().optional(),
  language: z.enum(["en", "mr", "hi"]).optional(),
  saved_crops: z.array(z.string().trim().min(1).max(40)).max(20).optional(),
});

export const updateFarmerProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => schema.parse(data))
  .handler(async ({ data, context }) => {
    const patch: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) patch[key] = value;
    }
    if (Object.keys(patch).length === 0) return { ok: true as const };

    const { error } = await context.supabase
      .from("profiles")
      .update(patch as never)
      .eq("id", context.userId);
    if (error) return { ok: false as const, error: error.message };
    return { ok: true as const };
  });
